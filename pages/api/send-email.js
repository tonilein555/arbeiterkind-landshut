import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { question } = req.body

  try {
    const data = await resend.emails.send({
      from: 'landshut@arbeiterkind.de',
      to: ['landshut@arbeiterkind.de'],
      subject: 'Neue Frage eingereicht',
      html: `<p>Neue Frage: ${question}</p>`,
    })

    res.status(200).json(data)
  } catch (error) {
    console.error('E-Mail Fehler:', error)
    res.status(500).json({ error: 'E-Mail konnte nicht gesendet werden' })
  }
}
