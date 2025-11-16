import fs from 'fs'
import pdfParse from 'pdf-parse'

const KNOWN_SKILLS = [
    "JavaScript", "React", "Node.js","MongoDB","Express","HTML","CSS","Python","Java" ,"SQL","Docker" ,"AWS","C++","TypeScript"
];

export async function extractSkillsFromResume(filePath){
    try {
        const fileBuffer = fs.readFileSync(filePath)
        const data = await pdfParse(fileBuffer)
        const text = data.text.toLowerCase()

        const extractSkills = KNOWN_SKILLS.filter(skill => text.includes(skill.toLowerCase()))

        return extractSkills
    } catch (error) {
        console.error(error)
        return []
    }
    
 }
