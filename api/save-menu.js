export default async function handler(req, res) {
  // CORS Headers para asegurar que pueda ser llamado desde el propio dominio
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Si es un pre-flight request de CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verificar método
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    // 1. Validar el token de Github
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return res.status(500).json({
        error: 'Falta configurar GITHUB_TOKEN en Vercel Environment Variables.'
      });
    }

    // 2. Extraer los datos del menú enviados desde el frontend
    const menuDataArray = req.body;
    if (!Array.isArray(menuDataArray)) {
      return res.status(400).json({ error: 'El cuerpo de la petición debe ser un arreglo JSON.' });
    }

    // 3. Formatear el contenido de la misma forma que el archivo original menu-data.js
    const formattedJson = JSON.stringify(menuDataArray, null, 2);
    const fileContent = `// Datos del menú oficial para el Sistema de Pedidos - Barbacoa Tatemada El Vale
// Generado automáticamente desde el Panel Administrativo (Vercel API)

const MENU_DATA = ${formattedJson};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MENU_DATA;
}
`;

    // 4. Codificar el contenido en Base64 (Requerido por Github API)
    const base64Content = Buffer.from(fileContent).toString('base64');

    // Configuración del Repositorio
    const owner = 'Denalatika';
    const repo = 'barbacoatatemada';
    const path = 'sistema-pedidos/menu-data.js';

    // 5. Obtener el SHA actual del archivo (Github requiere el SHA para actualizar)
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!getResponse.ok) {
      const errData = await getResponse.json();
      return res.status(getResponse.status).json({
        error: 'Error obteniendo archivo de Github', details: errData
      });
    }

    const currentFile = await getResponse.json();
    const currentSha = currentFile.sha;

    // 6. Hacer el Commit con el nuevo contenido
    const putResponse = await fetch(getUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Actualizar menú desde el Panel de Administración',
        content: base64Content,
        sha: currentSha
      })
    });

    if (!putResponse.ok) {
      const errData = await putResponse.json();
      return res.status(putResponse.status).json({
        error: 'Error guardando archivo en Github', details: errData
      });
    }

    const result = await putResponse.json();
    return res.status(200).json({
      success: true,
      message: '¡Archivo actualizado en Github exitosamente! Vercel desplegará los cambios en ~30s.',
      commit: result.commit.html_url
    });

  } catch (error) {
    console.error('Error en save-menu:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}
