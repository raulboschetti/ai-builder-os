import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface BusinessAnalysisResult {
  viability: string;
  summary: string;
  keyFeatures: string[];
  risks: string[];
}

const MODEL = 'claude-sonnet-5';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: Anthropic;

  constructor(configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: configService.getOrThrow<string>('ANTHROPIC_API_KEY'),
    });
  }

  /**
   * Analiza la viabilidad de un negocio a partir de lo que describió el
   * usuario. Interfaz deliberadamente simple (texto entra, objeto sale) —
   * quien la llama no sabe ni le importa qué modelo o proveedor hay detrás,
   * así que cambiarlo más adelante no afecta al resto de la app.
   */
  async generateBusinessAnalysis(
    businessVertical: string | null,
    description: string | null,
  ): Promise<BusinessAnalysisResult> {
    const prompt = this.buildPrompt(businessVertical, description);

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = response.content.find((c) => c.type === 'text');
    const text = block && block.type === 'text' ? block.text : '';

    return this.parseResult(text);
  }

  private buildPrompt(
    businessVertical: string | null,
    description: string | null,
  ): string {
    return `Eres un analista de negocio pragmático que ayuda a emprendedores no técnicos a evaluar si su idea merece construirse como aplicación/web.

Vertical de negocio: ${businessVertical || 'no especificado'}
Descripción que ha dado el dueño del negocio: ${description || 'no especificada'}

Analiza esta idea y responde ÚNICAMENTE con un JSON válido (sin texto antes ni después, sin bloque de código markdown), con esta forma exacta:
{
  "viability": "una frase corta tipo veredicto, ej: 'Viable' / 'Viable con matices' / 'Necesita más información'",
  "summary": "2-3 frases explicando el porqué, en español, dirigidas a alguien sin conocimientos técnicos",
  "keyFeatures": ["3 a 5 funcionalidades concretas que necesitaría la aplicación"],
  "risks": ["1 a 3 riesgos o cosas a tener en cuenta, en lenguaje sencillo"]
}`;
  }

  private parseResult(text: string): BusinessAnalysisResult {
    const cleaned = text
      .trim()
      .replace(/^```(json)?/i, '')
      .replace(/```$/, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      return {
        viability: String(parsed.viability ?? ''),
        summary: String(parsed.summary ?? ''),
        keyFeatures: Array.isArray(parsed.keyFeatures)
          ? parsed.keyFeatures.map(String)
          : [],
        risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
      };
    } catch {
      this.logger.error(`No se pudo interpretar la respuesta de la IA: ${text}`);
      throw new BadGatewayException(
        'La IA no ha devuelto una respuesta válida. Inténtalo de nuevo.',
      );
    }
  }
}
