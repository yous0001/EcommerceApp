import  QRCode  from "qrcode"

export async function QRCodeGeneration(data){
    const qrCode=await QRCode.toDataURL(JSON.stringify(data),{errorCorrectionLevel:'H'})
    return qrCode
}