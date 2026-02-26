const { google } = require('googleapis');

module.exports = async function handler(req, res) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        const drive = google.drive({ version: 'v3', auth });
        const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        const foldersRes = await drive.files.list({
            q: `'${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name)',
        });

        const categories = foldersRes.data.files || [];
        const items = {};

        for (const folder of categories) {
            const filesRes = await drive.files.list({
                q: `'${folder.id}' in parents and trashed=false and (mimeType contains 'image/' or mimeType contains 'video/')`,
                fields: 'files(id,name,mimeType,thumbnailLink,description,webViewLink)',
            });

            items[folder.id] = filesRes.data.files || [];
        }

        res.status(200).json({ categories, items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Portfolio fetch failed' });
    }
};