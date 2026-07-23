import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface BusinessAnalysisResult {
  viability: string;
  summary: string;
  keyFeatures: string[];
  risks: string[];
  recommendation: string;
  marketCostEstimate: string;
}

export interface RoadmapPhase {
  title: string;
  days: string;
  tasks: string[];
}

export interface RoadmapResult {
  phases: RoadmapPhase[];
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
    const prompt = this.buildAnalysisPrompt(businessVertical, description);
    const text = await this.complete(prompt, 1500);
    const parsed = this.parseJson(text);

    return {
      viability: String(parsed.viability ?? ''),
      summary: String(parsed.summary ?? ''),
      keyFeatures: Array.isArray(parsed.keyFeatures)
        ? parsed.keyFeatures.map(String)
        : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
      recommendation: String(parsed.recommendation ?? ''),
      marketCostEstimate: String(parsed.marketCostEstimate ?? ''),
    };
  }

  /**
   * Herramienta gratuita pública (sin login) — genera un roadmap de 90
   * días para lanzar el negocio descrito. Es un imán de captación, no
   * algo que un usuario logueado usa dentro de un proyecto.
   */
  async generateRoadmap(
    businessVertical: string | null,
    description: string | null,
  ): Promise<RoadmapResult> {
    const prompt = this.buildRoadmapPrompt(businessVertical, description);
    const text = await this.complete(prompt, 1800);
    const parsed = this.parseJson(text);

    const phases = Array.isArray(parsed.phases) ? parsed.phases : [];

    return {
      phases: phases.map((phase: Record<string, unknown>) => ({
        title: String(phase.title ?? ''),
        days: String(phase.days ?? ''),
        tasks: Array.isArray(phase.tasks) ? phase.tasks.map(String) : [],
      })),
    };
  }

  private async complete(prompt: string, maxTokens: number): Promise<string> {
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = response.content.find((c) => c.type === 'text');
    return block && block.type === 'text' ? block.text : '';
  }

  private buildAnalysisPrompt(
    businessVertical: string | null,
    description: string | null,
  ): string {
    return `Eres el analista de negocio de Kroquix, una plataforma donde el cliente describe su negocio y la IA le construye la aplicación. Ayudas a emprendedores no técnicos a evaluar su idea. Sé objetivo con el veredicto — no exageres la viabilidad para quedar bien — pero nunca dejes al usuario sin un camino a seguir: pase lo que pase, tiene que salir de aquí sabiendo qué hacer a continuación.

Regla importante: el "siguiente paso" que propongas SIEMPRE tiene que ser algo que se construye aquí, en Kroquix — nunca recomiendes herramientas externas, competidores ni "prueba primero con [otro producto]". Si la idea tal cual es demasiado ambiciosa o hay dudas, la solución es reducir el alcance (empezar solo con las funcionalidades imprescindibles y ampliar después), no mandar al cliente a otro sitio. Puedes mencionar en "risks" que existen alternativas en el mercado si es relevante para que el cliente tenga el contexto completo, pero la recomendación en sí siempre construye con nosotros.

Vertical de negocio: ${businessVertical || 'no especificado'}
Descripción que ha dado el dueño del negocio: ${description || 'no especificada'}

Analiza esta idea y responde ÚNICAMENTE con un JSON válido (sin texto antes ni después, sin bloque de código markdown), con esta forma exacta:
{
  "viability": "una frase corta tipo veredicto, ej: 'Viable' / 'Viable con matices' / 'Necesita más información'",
  "summary": "2-3 frases explicando el porqué, en español, dirigidas a alguien sin conocimientos técnicos",
  "keyFeatures": ["3 a 5 funcionalidades concretas que necesitaría la aplicación"],
  "risks": ["1 a 3 riesgos o cosas a tener en cuenta, en lenguaje sencillo"],
  "recommendation": "2-3 frases con el siguiente paso concreto A CONSTRUIR EN KROQUIX. Si es viable tal cual, qué funcionalidades empezar construyendo primero. Si es demasiado ambicioso, qué versión reducida construir primero para validarlo. Nunca sugieras herramientas de fuera",
  "marketCostEstimate": "Estimación REALISTA (ni inflada ni a la baja) de lo que costaría contratar a un desarrollador freelance o una agencia en España para construir estas funcionalidades concretas: un rango en euros de desarrollo inicial, y otro rango de mantenimiento mensual aproximado. 1-2 frases, cifras concretas basadas en las funcionalidades listadas arriba, no genéricas"
}`;
  }

  private buildRoadmapPrompt(
    businessVertical: string | null,
    description: string | null,
  ): string {
    return `Eres el estratega de lanzamiento de Kroquix, una plataforma donde alguien sin conocimientos técnicos describe su negocio y la IA se lo construye (app, web, gestión de reservas, etc). Esta herramienta es gratuita y pública — la usa gente que todavía no se ha registrado, como primer contacto con el producto.

Genera un roadmap realista de 90 días para lanzar este negocio como aplicación. Cuando el roadmap incluya un paso de "construir la aplicación/web", indica que eso se hace en Kroquix — nunca menciones herramientas o competidores externos.

Vertical de negocio: ${businessVertical || 'no especificado'}
Descripción: ${description || 'no especificada'}

Responde ÚNICAMENTE con un JSON válido (sin texto antes ni después, sin bloque de código markdown), con esta forma exacta:
{
  "phases": [
    { "title": "nombre corto de la fase (ej: Validar y definir)", "days": "Días 1-30", "tasks": ["3 a 5 tareas concretas y accionables"] },
    { "title": "...", "days": "Días 31-60", "tasks": ["..."] },
    { "title": "...", "days": "Días 61-90", "tasks": ["..."] }
  ]
}`;
  }

  private parseJson(text: string): Record<string, unknown> {
    const cleaned = text
      .trim()
      .replace(/^```(json)?/i, '')
      .replace(/```$/, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      this.logger.error(`No se pudo interpretar la respuesta de la IA: ${text}`);
      throw new BadGatewayException(
        'La IA no ha devuelto una respuesta válida. Inténtalo de nuevo.',
      );
    }
  }
}
