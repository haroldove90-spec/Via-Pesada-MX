import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "dummy_key",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint to analyze custom message using official Schema
app.post("/api/analyze", async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "El mensaje es requerido." });
  }

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return res.status(500).json({
      error: "La clave API de Gemini no está configurada. Por favor, asegúrate de tenerla guardada en los Secrets de la barra de herramientas.",
    });
  }

  try {
    const prompt = `Analiza el reporte de WhatsApp de un trailero en México y extrae los campos en formato JSON:
"${message}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `Eres un experto despachador vial y monitorista de seguridad en carreteras de México. El usuario te dará un reporte informal de WhatsApp. Debes transformarlo y estandarizarlo en un objeto JSON con la siguiente estructura.

- tipo_alerta: Debe ser estrictamente uno de los siguientes: "seguridad", "accidente", "reten", "bloqueo".
  * "seguridad": presencia de asaltos, camionetas sospechosas con gente armada, ponchallantas, robo activo, balaceras.
  * "accidente": volcaduras, choques, vehículos descompuestos, carga tirada.
  * "reten": operativos de aduana, migración, policía nacional, básculas de la SCT (Secretaría de Infraestructura, Comunicaciones y Transportes).
  * "bloqueo": cierres sociales, manifestaciones, ejidatarios, clima extremo que bloquee por completo.
- carretera: Nombre formal o comúnmente conocido de la vía, ej: "México-Puebla", "Querétaro-Irapuato", "Libre a Monterrey".
- kilometro: El kilómetro exacto si se indica (ej: 72) o la referencia geográfica si es lo que hay (ej: "Caseta Palmillas"). Si no hay mención ni referencia aproximable, pon null.
- sentido: Ej. "a CDMX", "a Monterrey", "a Puebla", "a Querétaro", "ambos", "desconocido". Indica la orientación o destino final del carril obstruido.
- descripcion_corta: Una frase breve, en español formal, que describa precisamente el evento (máximo 12 palabras).
- nivel_riesgo: Nivel de riesgo logístico y de seguridad para transportistas, debe ser estrictamente uno de: "alto" (amenaza física inmediata, pérdida de carga o tráfico totalmente detenido y colapsado), "medio" (demoras relevantes por revisiones, filas lentas, carril obstruido pero fluyendo), "bajo" (aviso preventivo sin paros severos ni peligro inminente).`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tipo_alerta: {
              type: Type.STRING,
              description: "Tipo de la alerta: seguridad, accidente, reten o bloqueo.",
            },
            carretera: {
              type: Type.STRING,
              description: "Nombre o número de la carretera o autopista nacional.",
            },
            kilometro: {
              type: Type.STRING,
              description: "Número de kilómetro aproximado o punto de referencia en la carretera.",
            },
            sentido: {
              type: Type.STRING,
              description: "Sentido del tráfico hacia donde se origina el problema (ej: a Puebla, a Laredo).",
            },
            descripcion_corta: {
              type: Type.STRING,
              description: "Resumen súper corto del evento (hasta 12 palabras).",
            },
            nivel_riesgo: {
              type: Type.STRING,
              description: "Nivel de riesgo logístico/seguridad: alto, medio, bajo.",
            }
          },
          required: ["tipo_alerta", "carretera", "sentido", "descripcion_corta", "nivel_riesgo"]
        }
      }
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("No se obtuvo respuesta del modelo Gemini.");
    }

    const parsedData = JSON.parse(text);
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Error al procesar reporte con Gemini:", error);
    return res.status(500).json({ error: error.message || "Error al analizar el reporte." });
  }
});

// Vite Middleware Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
