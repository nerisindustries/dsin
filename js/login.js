
document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById('formLogin');
    const erroDiv = document.getElementById('loginErro');

    formLogin.addEventListener('submit', (event) => {
        event.preventDefault(); 
        
        const usuario = document.getElementById('usuario').value.trim();
        const senha = document.getElementById('senha').value;

        if (usuario === "oprotetor" && senha === "H6ABPL") {
            erroDiv.classList.add('hidden');
            
          
            localStorage.setItem('FOGO_OPERADOR_LOGADO', usuario);
            
           
            window.location.href = 'central.html';
        } else {
           
            erroDiv.classList.remove('hidden');
        }
    });
});
