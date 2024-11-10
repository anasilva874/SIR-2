import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Low, JSONFile } from 'lowdb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.join(__dirname, 'db.json');

// Use apenas o JSONFile para instanciar o adaptador corretamente
const adapter = new JSONFile(dbFile);
const db = new Low(adapter); // Aqui, criamos o Low com o adapter

// Lê a base de dados
await db.read();
db.data ||= { students: [] }; // Inicializa a lista de estudantes se ainda não existir
await db.write();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rotas para manipulação dos estudantes
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

    // Verificar se o ID é único
    const existingStudent = db.data.students.find(s => s.id == id);
    if (existingStudent) {
        return res.status(400).json({ error: "ID already exists" });
    }

    const newStudent = { id: parseInt(id), name, course, year: parseInt(year) };
    db.data.students.push(newStudent);
    await db.write();
    res.status(201).json(newStudent);
});

// Rota PUT para atualizar um aluno por ID
app.put('/students/:id', async (req, res) => {
    const { id } = req.params; // Pega o ID do parâmetro da URL
    const updatedStudent = req.body; // Os novos dados do aluno
  
    // Lê o banco de dados
    await db.read();
  
    // Encontra o aluno pelo ID
    const studentIndex = db.data.students.findIndex(student => student.id === id);
  
    // Se o aluno não for encontrado, retorna um erro 404
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
  
    // Atualiza os dados do aluno
    db.data.students[studentIndex] = { ...db.data.students[studentIndex], ...updatedStudent };
  
    // Escreve de volta no arquivo
    await db.write();
  
    // Retorna o aluno atualizado
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

// Rotas para páginas HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,  'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname,  'about.html'));
});

app.get('/doc', (req, res) => {
    res.sendFile(path.join(__dirname,  'doc.html'));
});

const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
