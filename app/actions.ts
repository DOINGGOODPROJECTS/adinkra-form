"use server"

import { google } from "googleapis"
import { Readable } from "stream"

// Fonction pour configurer l'authentification Google
function getGoogleAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") || ""

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"],
  })

  return auth
}

export async function countFilledRowsInColumnA(): Promise<number> {
  const auth = getGoogleAuth()
  const sheets = google.sheets({ version: "v4", auth })
  
  const sheetId = process.env.GOOGLE_SHEET_ID
  const SHEET_NAME = process.env.SHEET_NAME

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A:A`, // Colonne A entière
    })

    const rows = response.data.values || []
    const filledRows = rows.filter(row => row[0] !== "").length

    console.log(`✅ Nombre de lignes remplies : ${filledRows}`)
    return (filledRows > 0 ? filledRows - 2 : 2)+1
  } catch (err) {
    console.error("❌ Erreur lors du comptage des lignes :", err)
    throw err
  }
}

// Fonction pour ajouter des données à Google Sheets
async function addToGoogleSheet(data: Record<string, string>) {
  try {
    const auth = getGoogleAuth()
    const sheets = google.sheets({ version: "v4", auth })

    const sheetId = process.env.GOOGLE_SHEET_ID
    const SHEET_NAME = process.env.SHEET_NAME
    const count = await countFilledRowsInColumnA();

    if (!sheetId) {
      throw new Error("ID de Google Sheet non défini")
    }

    // Préparer les données pour Google Sheets
    const values = [
      [
        new Date().toISOString(), // Timestamp
        data.nom_complet || "",
        data.date_naissance || "",
        data.nationalite || "",
        data.pays_residence || "",
        data.email || "",
        data.telephone || "",
        data.fonction || "",
        data.organisation || "",
        data.site_web_organisation || "",
        data.site_web_personnel || "",
        data.nombre_personnes || "",
        data.presentation_organisation || "",
        data.nombre_personne_equipe || "",
        data.contribution_liens_afrique_diaspora || "",
        data.quattendez_vous_reseau_adinkra || "",
        data.categorie_distinction || "",
        data.experience_leadership || "",
        data.resume_realisation || "",
        data.impact_communautaire || "",
        data.leadership_surmonte || "",
        data.prix_programmes_bourses_leadership || "",
        data.biographie_courte || "",
        data.video_motivation || "",
        data.autre_video || "",
        data.consentement === "true" ? "Oui" : "Non",
      ],
    ]

    // Ajouter les données à la feuille
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A${count}`, // Commence à la première cellule
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    })

    return true
  } catch (error) {
    console.error("Erreur lors de l'ajout à Google Sheets:", error)
    return false
  }
}

// Fonction pour télécharger un fichier sur Google Drive
async function uploadToDrive(file: File, fileName: string) {
  try {
    const auth = getGoogleAuth()
    const drive = google.drive({ version: "v3", auth })

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    if (!folderId) {
      throw new Error("ID de dossier Google Drive non défini")
    }

    // Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Créer un stream lisible à partir du buffer
    const readable = new Readable()
    readable._read = () => {} // _read est requis mais peut être vide
    readable.push(buffer)
    readable.push(null)

    // Télécharger le fichier sur Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: readable,
      },
    })

    return response.data.id
  } catch (error) {
    console.error("Erreur lors du téléchargement sur Google Drive:", error)
    return null
  }
}

// Action de soumission du formulaire
export async function submitForm(formData: FormData) {
  try {
    // Extraire les données du formulaire
    const data: Record<string, string> = {}

    // Traiter toutes les entrées de texte
    for (const [key, value] of formData.entries()) {
      if (key !== "files" && typeof value === "string") {
        data[key] = value
      }
    }

    // Ajouter les données à Google Sheets
    const sheetResult = await addToGoogleSheet(data)

    if (!sheetResult) {
      throw new Error("Erreur lors de l'ajout des données à Google Sheets")
    }

    // Traiter les fichiers
    const files = formData.getAll("files") as File[]
    const fileIds: string[] = []

    for (const file of files) {
      if (file.name && file.size > 0) {
        const fileId = await uploadToDrive(file, file.name)
        if (fileId) {
          fileIds.push(fileId)
        }
      }
    }

    // Mettre à jour la feuille avec les liens des fichiers si nécessaire
    // (Cette partie peut être développée selon les besoins)

    return { success: true, fileIds }
  } catch (error) {
    console.error("Erreur lors de la soumission du formulaire:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur inconnue est survenue",
    }
  }
}
