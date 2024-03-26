import easyinvoice from "easyinvoice";
import { DateTime } from "luxon";
import sendmailservice from "./send-email.service.js";
import fs from 'fs'

export async function createOrderInvoice({email,products,name}){
    var data = {
        apiKey: "free", 
        mode: "development",   
        images: {

            logo: "https://public.budgetinvoice.com/img/logo_en_original.png",

            background: "https://public.budgetinvoice.com/img/watermark-draft.jpg"
        },

        sender: {
            company: "yousef",
            address: "sohag tahta",
            zip: "1234 AB",
            city: "sohag",
            country: "egypt"

        },

        client: {
            company: "route",
            address: "elmady",
            zip: "4567 CD",
            city: "cairo",
            country: "egypt"

        },
        information: {

            number: "2021.0001",

            date: DateTime.now()
        },

        products: products,

        bottomNotice: "Kindly pay your invoice within 15 days.",

        settings: {
            currency: "EGP", 
        },
        
    };


    const result=await easyinvoice.createInvoice(data);
    await fs.writeFileSync("./temp/invoice.pdf", result.pdf, 'base64');
        
    
    
    const isEmailsent=await sendmailservice({
            to:email,
            subject:"order invoice",
            attachments:[{
                filename: `invoice.pdf`,
                path:'./temp/invoice.pdf',
                encoding: 'base64'
                }
                ]
            
        })
        if(!isEmailsent){
            return next(new Error("failed to send verification email",{cause:400 }))
        }


}


