document.addEventListener("DOMContentLoaded", () => {
  const studentList = document.getElementById("student-list");
  const studentForm = document.getElementById("student-form");

  async function loadStudents() {
      studentList.innerHTML = ""; // Limpa a lista antes de carregar novos dados
      try {
          const response = await fetch("/students");
          const students = await response.json();
          students.forEach(student => {
              const studentDiv = document.createElement("div");
              studentDiv.classList.add("student-item"); // Estilo adicional
              studentDiv.innerHTML = `
                  <p><strong>Id:</strong> ${student.id}</p>
                  <p><strong>Nome:</strong> ${student.name}</p>
                  <p><strong>Curso:</strong> ${student.course}</p>
                  <p><strong>Ano de escolaridade:</strong> ${student.year}</p>
                  <button onclick="removeStudent(${student.id})">Remover</button>
                  <hr>
              `;
              studentList.appendChild(studentDiv);
          });
      } catch (error) {
          console.error("Erro ao carregar estudantes:", error);
      }
  }

  studentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(studentForm);
      const data = Object.fromEntries(formData.entries());
      
      try {
          const response = await fetch("/students", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data)
          });

          if (!response.ok) {
              const error = await response.json();
              alert(error.error || "Erro ao adicionar estudante");
          } else {
              studentForm.reset();
              loadStudents();
          }
      } catch (error) {
          console.error("Erro ao adicionar estudante:", error);
      }
  });

  window.removeStudent = async (id) => {
      try {
          const response = await fetch(`/students/${id}`, { method: "DELETE" });
          if (response.ok) {
              loadStudents();
          } else {
              alert("Erro ao remover estudante");
          }
      } catch (error) {
          console.error("Erro ao remover estudante:", error);
      }
  };

  loadStudents();
});
