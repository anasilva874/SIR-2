import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Low, JSONFile } from 'lowdb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.join(__dirname, 'db.json');

const adapter = new JSONFile(dbFile);
const db = new Low(adapter); 

await db.read();
db.data ||= { students: [] }; 
await db.write();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/students', async (req, res) => {
    await db.read();
    res.json(db.data.students);
});

app.get('/students/:id', async (req, res) => {
    await db.read();
    const student = db.data.students.find(s => s.id == req.params.id);
    student ? res.json(student) : res.status(404).json({ error: "Student not found" });
});

app.post('/students', async (req, res) => {
    const { id, name, course, year } = req.body;
    await db.read();

    const existingStudent = db.data.students.find(s => s.id == id);
    if (existingStudent) {
        return res.status(400).json({ error: "ID already exists" });
    }

    const newStudent = { id: parseInt(id), name, course, year: parseInt(year) };
    db.data.students.push(newStudent);
    await db.write();
    res.status(201).json(newStudent);
});

app.put('/students/:id', async (req, res) => {
    const { id } = req.params; 
    const updatedStudent = req.body; 
  
    await db.read();
  
    const studentIndex = db.data.students.findIndex(student => student.id === id);
  
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
  
    db.data.students[studentIndex] = { ...db.data.students[studentIndex], ...updatedStudent };
  
    await db.write();
  
    res.status(200).json(db.data.students[studentIndex]);
  });

app.delete('/students/:id', async (req, res) => {
    await db.read();

    const index = db.data.students.findIndex(s => s.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: "Student not found" });
    }

    const deletedStudent = db.data.students.splice(index, 1);
    await db.write();
    res.json(deletedStudent[0]);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,  'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname,  'about.html'));
});

app.get('/doc', (req, res) => {
    res.sendFile(path.join(__dirname,  'doc.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
