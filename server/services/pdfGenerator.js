const PDFDocument = require("pdfkit")

exports.generatePDF = (data,res)=>{

const doc = new PDFDocument()

res.setHeader(
"Content-Type",
"application/pdf"
)

res.setHeader(
"Content-Disposition",
"attachment; filename=report.pdf"
)

doc.pipe(res)

doc.fontSize(20)
.text("Margadarshak AI Report",{
align:"center"
})

doc.moveDown()

Object.keys(data).forEach(key=>{

doc.fontSize(14)
.text(`${key}: ${data[key]}`)

doc.moveDown()

})

doc.end()

}