const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Configurar o multer para armazenar arquivos temporariamente
const upload = multer({ dest: 'uploads/' });

// Caminho para o arquivo JSON da Conta de Serviço
const SERVICE_ACCOUNT_KEY_FILE = 'service_account_key.json';

// Autenticação com a conta de serviço
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

// Função para fazer upload para o Google Drive
async function uploadToDrive(filePath, fileName) {
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: fileName,
    parents: ['YOUR_GOOGLE_DRIVE_FOLDER_ID'], // ID da sua pasta no Google Drive
  };

  const media = {
    mimeType: 'video/mp4',
    body: fs.createReadStream(filePath),
  };

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });
    console.log('File ID: ', file.data.id);
  } catch (error) {
    console.error('Error uploading file: ', error);
  }
}

// Rota para upload de vídeo
app.post('/upload', upload.single('video'), async (req, res) => {
  const tempFilePath = req.file.path;
  const fileName = req.file.originalname;

  try {
    // Faz o upload para o Google Drive
    await uploadToDrive(tempFilePath, fileName);

    // Apaga o arquivo temporário
    fs.unlinkSync(tempFilePath);

    res.status(200).send('Upload realizado com sucesso!');
  } catch (error) {
    res.status(500).send('Erro no upload: ' + error);
  }
});

// Serve arquivos estáticos do diretório public
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
