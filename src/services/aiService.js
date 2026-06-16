const Groq = require('groq-sdk');
const groq = new Groq({
    apiKey:process.env.GROQ_API_KEY
});
exports.classifyTicket = async(subject,message)=>{
    const prompt = `
    Ты система классификации обращений в службу поддержки.
    Проанализируй обращение и верни ТОЛЬКО JSON без лишнего текста.
    Обращение:
    Тема: ${subject}
    Сообщение: ${message}
    
    Верни JSON в таком формате:
    {
    "category":"Одна из: login_issue | technical_problem | question | complaint | suggestion | other"
    "priority": "Одна из: low | medium | high"
    "summary": "Краткое резюме обращения в 1-2 предложения"
    }

    Правила приоритета: 
    -high: срочные проблемы, упоминание денег, критические сбои
    -medium: стандартные обращения
    -low: вопросы, предложения
    `;
    const response = await groq.chat.completions.create({
        model:'llama-3.1-8b-instant',
        messages:[{role:'user',content:prompt}],
        temperature:0.1,
        max_tokens:200
    });
    const text = response.choices[0].message.content.trim();

    const json = JSON.parse(text)
    return json;
}