import {auth as googleAuth, forms} from "@googleapis/forms";
import {drive} from "@googleapis/drive";
import process from "node:process";
import {APPLICATION, readJson} from "../io.js";

const JWT_AUTH = new googleAuth.JWT(
    process.env.CLIENT_EMAIL,
    process.env.CLIENT_PRIVATE_KEY_PATH,
    null, // Key is null because we pass the key file above
    [
        "https://www.googleapis.com/auth/forms",
        "https://www.googleapis.com/auth/drive"
    ]
);

JWT_AUTH.authorize()

const formsAPI = forms({version: "v1", auth: JWT_AUTH});
const driveAPI = drive({version: "v2", auth: JWT_AUTH});

const application = readJson(APPLICATION);

async function fetchGoogleDriveFiles() {
    return await driveAPI.files.list({ spaces: "drive" });
}

async function clearGoogleDrive() {
    const files = await fetchGoogleDriveFiles();
    for (const file of files.data.items) {
        await driveAPI.files.delete({fileId: file.id});
    }
    await driveAPI.files.emptyTrash()
}

async function createNewApplicationForm(interaction) {
    const form = await formsAPI.forms.create({
        requestBody: {
            info: {
                title: "Mechanists Application Form",
                documentTitle: "$$USER$$'s Application form.", // TODO: Add clicker's username here
            }
        }
    })
    const updatedForm = await formsAPI.forms.batchUpdate({
        formId: form.data.formId,
        requestBody: {
            includeFormInResponse: true,
            requests: application["create-item-requests"].map((req, index) => {
                req["createItem"]["location"] = { "index": index };
                return req;
            })
        }
    })
    interaction.editReply({content: `Fill the form here ${updatedForm.data.form.responderUri}`})
    // console.log(JSON.stringify(form.data, null, "  "))
}

async function fetchApplicationResponses() {
}

export {createNewApplicationForm, fetchApplicationResponses};