const landingScreen = document.getElementById('landingScreen');
const videoScreen = document.getElementById('videoScreen');
const video = document.getElementById('introVideo');
const startBtn = document.getElementById('startBtn');
const progressBar = document.getElementById('progressBar');

const destino = 'login.html'; 
let isHolding = false;
let progress = 0;
let intervalId = null;

const tempoParaPular = 1500; 
const taxaAtualizacao = 20; 

// AÇÃO DO CLIQUE: Esconde o 'Sobre Nós', mostra o vídeo e inicia com som
startBtn.addEventListener('click', () => {
    // Esconde a tela inicial
    landingScreen.style.opacity = '0';
    landingScreen.style.visibility = 'hidden';

    // Mostra a tela do vídeo e dá o Play
    videoScreen.classList.add('active');
    
    // Força o vídeo a iniciar desmutado
    video.muted = false;
    video.play().catch(error => {
        console.log("Iniciando com mudo devido às políticas rigorosas do navegador:", error);
        video.muted = true;
        video.play();
    });
});

// LÓGICA DE SEGURAR ESPAÇO PARA PULAR
function iniciarContagem() {
    // Só executa se o vídeo já estiver visível e rodando
    if (isHolding || !videoScreen.classList.contains('active')) return;
    isHolding = true;

    intervalId = setInterval(() => {
        progress += (taxaAtualizacao / tempoParaPular) * 100;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(intervalId);
            pularVideo();
        }
        
        progressBar.style.width = `${progress}%`;
    }, taxaAtualizacao);
}

function pararContagem() {
    if (!isHolding) return;
    isHolding = false;
    clearInterval(intervalId);
    
    let limparProgresso = setInterval(() => {
        if (progress > 0 && !isHolding) {
            progress -= 10;
            if (progress < 0) progress = 0;
            progressBar.style.width = `${progress}%`;
        } else {
            clearInterval(limparProgresso);
        }
    }, 20);
}

function pularVideo() {
    window.location.href = destino;
}

// Eventos Globais do Teclado
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); 
        iniciarContagem();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        pararContagem();
    }
});

// Quando o vídeo terminar por completo, vai para a outra página
video.addEventListener('ended', pularVideo);
