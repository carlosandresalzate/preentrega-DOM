/**
 * @file script.js
 * @brief Este script contiene funciones para un juego de memoria.
 * @author Carlos Andres Alzate
 * @version 1.0
 * @license MIT
 */

// Variables Globales
// #region Variables Globales
/**
 * @brief Indica si el juego esta en modo relax (sin limite de tiempo).
 * @type {boolean}
 * @global
 */
let modoRelax = false;

/**
 * @brief Almacena la cantidad de movimientos realizados por el jugador
 * @type {number}
 * @global
 */
let movimientos = 0;

/**
 * @brief Almacena el intervalo de tiempo del cronometro
 * @type {number}
 * @global
 */
let cronometro;

/**
 * @brief Array que contiene los grupos de trajetas para cada nivel.
 * @type {Array<Array<string>>}
 * @global
 */
let grupoTarjetas = [
  ['🦄', '🍦'],
  ['🌈', '👽'],
  ['👾', '🤖', '👹', '👺'],
  ['🤡', '💩', '🎃', '🙀'],
  ['☠️', '👾', '😽', '😼'],
];

/**
 * @brief Almacena el nivel actual
 * @type {number}
 * @global
 */
let nivelActual = 0;

/**
 * @brief Array que contiene la configuracion de cada nivel.
 * @type {Array<{tarjetas: Array<string>, movimientosMax: number}>}
 * @global
 */
let niveles = [
  /**
   * Nivel
   * @type {Object}
   * @property {Array<string>} tarjeas - las tajetas disponibles en este nivel.
   * @property {number} movimientosMax - El numero maximo de movimientos permitidos.
   */
  {
    tarjetas: grupoTarjetas[0],
    movimientosMax: 3,
  },
  {
    tarjetas: grupoTarjetas[0].concat(grupoTarjetas[1]),
    movimientosMax: 8,
  },
  {
    tarjetas: grupoTarjetas[0].concat(grupoTarjetas[1], grupoTarjetas[2]),
    movimientosMax: 12,
  },
  {
    tarjetas: grupoTarjetas[0].concat(
      grupoTarjetas[1],
      grupoTarjetas[2],
      grupoTarjetas[3]
    ),
    movimientosMax: 25,
  },
  {
    tarjetas: grupoTarjetas[0].concat(
      grupoTarjetas[1],
      grupoTarjetas[2],
      grupoTarjetas[3],
      grupoTarjetas[4]
    ),
    movimientosMax: 60,
  },
];

// Descubrir y comparar
// #region descubrir y comparar
/**
 * @brief Descubre una tarjeta y la compara con otra.
 * @function descubrir
 * @this {HTMLElement}
 * @global
 */
function descubrir() {
  // Obtiene las tarjetas descubiertas
  let descubiertas;
  let tarjetasPendientes;
  let totalDescubiertas = document.querySelectorAll(
    '.descubiertas:not(.acertada)'
  );

  // Si ya hay dos tarjetas descubiertas, no hacer nada
  if (totalDescubiertas.length > 1) {
    return;
  }

  // Marca la tarjeta como descubierta y reproduce el sonido
  this.classList.add('descubierta');
  document.querySelector('#sonido-carta').cloneNode().play();

  // Obtiene las tarjetas descubiertas y reproduce el sonido
  descubiertas = document.querySelectorAll('.descubierta:not(.acertada)');

  // Si hay menos de dos tarjetas descubiertas (excluyendo las acertadas)
  if (descubiertas.length < 2) {
    return;
  }

  // Compara las tarjetas descubiertas
  comparar(descubiertas);
  actualizaContador();

  // Verifica si se han acertado todas las tarjetas
  tarjetasPendientes = document.querySelectorAll('.tarjeta:not(.acertada)');
  if (tarjetasPendientes.length === 0) {
    setTimeout(finalizar, 1000);
  }
}

/**
 * @brief Compara dos tarjetas para ver si son iguales
 * @param {Array<HTMLElement>} tarjetasAComparar - las tarjetas a comparar
 * @function comprar
 * @global
 */
function comparar(tarjetasAComparar) {
  // obtiene las tarjetas y compara los valores
  if (
    tarjetasAComparar[0].dataset.valor === tarjetasAComparar[1].dataset.valor
  ) {
    acierto(tarjetasAComparar);
  } else {
    error(tarjetasAComparar);
  }
}

// Baraja reparte
// #region baraja reparte

/**
 * @brief Baraja un conjunto de tarjetas.
 * @function barajaTarjetas
 * @param {Array<string>} lasTarjetas - las tarjetas a barajar.
 * @returns {Array<string>} - El conjunto de tarjetas barajadas.
 * @global
 */
function barajaTarjetas(lasTarjetas) {
  let totalTarjetas = lasTarjetas.concat(lasTarjetas);
  let resultado = totalTarjetas.sort(() => {
    0.5 - Math.random();
  });
  return resultado;
}

/**
 * @brief Reparte un conjunto de tarjetas en la mesa.
 * @param {Array<string>} lasTarjetas - las tarjetas a repartir.
 * @global
 */
function reparteTarjetas(lasTarjetas) {
  let mesa = document.querySelector('#mesa');
  let tarjetasBarajadas = barajaTarjetas(lasTarjetas);
  mesa.innerHTML = '';

  tarjetasBarajadas.forEach((element) => {
    let tarjeta = document.createElement('div');

    tarjeta.innerHTML = `
    <div class='tarjeta' data-valor='${element}'>
      <div class='tarjeta__contenido'>${element}</div>
    </div>`;

    mesa.appendChild(tarjeta);
  });
}

// Acierto error
// #region Acierto Error
/**
 * @brief Marca las tarjetas como acertadas cundo se encuentran iguales.
 * @param {Array<HTMLElement} lasTarjetas - las tarjeas que se han acertado.
 * @function acierto
 * @global
 */
function acierto(lasTarjetas) {
  // Marca las tarjetas como acertadas y reproduce el sonido de acierto
  lasTarjetas.forEach((element) => {
    element.classList.add('acertada');
  });
  document.querySelector('#sonido-acierto').play();
}

/**
 * @brief Marca las tarjetas como error cuando no coinciden.
 * @param {Array<HTMLElement>} lasTarjetas - Las tarjetas que se han comprado
 * @function error
 */
function error(lasTarjetas) {
  // marca las tarjetas como error y reproduce el sonido de error
  lasTarjetas.forEach((element) => {
    element.classList.add('error');
  });

  document.querySelector('#sonido-error').play();

  // Elimina la clase descubierta y error despues de un segundo
  setTimeout(function () {
    lasTarjetas.forEach((element) => {
      element.classList.remove('descubierta');
      element.classList.remove('error');
    });
  }, 1000);
}

// Contador
// #region Contador

/**
 * @brief Actualiza el contador de movimientos en el juego
 * @function actualizaContador
 * @global
 */
function actualizaContador() {
  let movimientosTexto;
  movimientos++;
  movimientosTexto = movimientos;

  // Verifica si se ha exedido el numero maximo de movimientos
  if (movimientos > niveles[nivelActual].movimientosMax && !modoRelax) {
    gameOver();
    return;
  }

  // Formatea el texto del contador
  if (movimientos < 10) {
    movimientosTexto = `0 ${movimientos}`;
  }

  // actualiza el contador en la interfaz
  document.querySelector('#mov').innerText = movimientosTexto;
}

/**
 * @brief Muestra la cantidad macima de movimientos permitidos en el nivel
 * @function maxContador
 * @global
 */
function maxContador() {
  let movimientosMaxTexto = niveles[nivelActual].movimientosMax;
  if (movimientosMaxTexto < 10) {
    movimientosMaxTexto = `0 ${movimientosMaxTexto}`;
  }
  document.querySelector('#mov-total').innerText = movimientosMaxTexto;
}

// Cronometro
// #region Cronometro

/**
 * @brief Inicia el cronometro para el juego.
 * @function iniciaCronometro
 * @global
 */
function iniciaCronometro() {
  // el tiempo por defecto del contador
  let segundos = 10;
  let minutos = 0;
  let segundosTexto;
  let minutosTexto;

  /**
   * @brief Actualiza el contador del cronometro.
   * @function actualizaContador
   * @inner
   */
  function actualizaContador() {
    segundos--;
    if (segundos < 0) {
      segundos = 59;
      minutos--;
    }
    if (minutos < 0) {
      segundos = 0;
      minutos = 0;
      clearInterval(cronometro);
      timeOver();
    }

    segundosTexto = segundos;
    minutosTexto = minutos;
    if (segundos < 10) {
      segundosTexto = `0 ${segundos}`;
    }
    if (minutos < 10) {
      minutosTexto = `0 ${minutos}`;
    }
    document.querySelector('#minutos').innerText = minutosTexto;
    document.querySelector('#segundos').innerText = segundosTexto;
  }
  cronometro = setInterval(actualizaContador, 1000);
}

// Finalizar
// #region Finalizar

/**
 * @brief Finaliza el juego y muestra la pantalla de finalizacion.
 * @function finalizar
 * @global
 */
function finalizar() {
  clearInterval(cronometro);
  if (nivelActual < niveles.length - 1) {
    document.querySelector('#subeNivel').classList.add('visible');
  } else {
    document.querySelector('#endGame').classList.add('visible');
  }
}

// Cambiar Nivel
// #region Cambiar Nivel

/**
 * @brief Sube el juego al siguiente nivel
 * @function subeNivel
 * @global
 */
function subeNivel() {
  nivelActual++;
}

/**
 * @brief Actualiza el numero de nivel actual en la interfaz.
 * @function actualizaNivel
 * @global
 */
function actualizaNivel() {
  console.log('actualizaNivel()')
  let nivelTexto = nivelActual + 1;
  console.log(nivelTexto);

  if (nivelTexto < 10) {
    nivelTexto = `0 ${nivelTexto}`;
  }
  let nivel = document.querySelector('#nivel');
  nivel.innerText = nivelTexto;
}

/**
 * @brief Carga un nuevo nivel en el juego
 * @function cargaNuevoNivel
 * @global
 */
function cargaNuevoNivel() {
  subeNivel();
  actualizaNivel();
  iniciar();
}

// GameOver
// #region GameOver

/**
 * @brief Muestra la pantalla GameOver
 * @function gameOver
 * @global
 */
function gameOver() {
  clearInterval(cronometro);
  document.querySelector('#gameOver').classList.add('visible');
}

/**
 * @brief Muestra la pantalla TimeOver cuando se agota el tiempo
 * @function timeOver
 * @global
 */
function timeOver() {
  document.querySelector('#timeOver').classList.add('visible');
}

// Menu Niveles
// #region Menu Niveles

/**
 * @brief Escribe los niveles disponibles en el menu de seleccion.
 * @function escribeNiveles
 * @global
 */
function escribeNiveles() {
  let menuNiveles = document.querySelector('.selecciona-nivel ul');
  niveles.forEach((element, indice) => {
    let controlNivel = document.createElement('li');
    controlNivel.innerHTML = `
    <button class='nivel' data-nivel=${indice}>
      Nivel ${indice + 1}
    </button>"
    `;
    menuNiveles.appendChild(controlNivel);
  });
}

/**
 * @brief Cambia el nivel selecionado por el jugador
 * @param {Event} evento - Evento de clic en el boton nivel.
 * @funtion cambiaNivel
 * @global
 */
function cambiaNivel(evento) {
  evento.stopPropagation();
  console.log('inicia Evento');
  // console.log('evento', evento);
  console.log('this', this);

  let nivel = parseInt(this.dataset.nivel);
  if(nivel >= 0 && nivel < niveles.length) {
    nivelActual = nivel;
    actualizaNivel();
    iniciar();
  }
}

/**
 * @brief muestra el menu de selecion de niveles
 * @param {Event} evento - Evento de clic en el boton control de niveles.
 * @function muestraMenuNiveles
 * @global
 */
function muestraMenuNiveles(evento) {
  evento.stopPropagation();
  document.querySelector('.selecciona-nivel').classList.toggle('visible');
}

/**
 * @brief Oculta el menu de niveles.
 * @function ocultaMenuNiveles
 * @global
 */
function ocultaMenuNiveles() {
  document.querySelector('.selecciona-nivel').classList.remove('visible');
}

/**
 * @brief Maneja el clic fuera del menu de seleccion para cerralo si es necesario
 * @param {Event} evento - Evento del clic fuera del menu de seleccion
 * @function clickFueradeMenu
 * @global
 *
 */
function clickFueradeMenu(evento) {
  if (evento.target.closest('.selecciona-nivel')) {
    return;
  }
  document.querySelector('.selecciona-nivel').classList.remove('visible');
}

/**
 * @brief Cierra el menu de seleccion de niveles cuando se presiona la tecla Escape
 * @param {Event} evento - Evento de tecla presionada
 * @function teclasEscCierraMenu
 * @global
 */
function teclasEscCierraMenu(evento) {
  // console.log(evento.key);
  if (evento.key === 'Escape') {
    ocultaMenuNiveles();
  }
}

// Inicio
// #region Incio

/**
 * @brief Inicia el juego con el nivel actual
 * @function iniciar
 * @global
 */
function iniciar() {
  movimientos = 0;
  reparteTarjetas(niveles[nivelActual].tarjetas);
  document.querySelector('#mov').innerText = '00';
  maxContador();
  document.querySelector('.selecciona-nivel').classList.remove('visible');
  document.querySelector('#endGame').classList.remove('visible');
  document.querySelector('#timeOver').classList.remove('visible');
  document.querySelector('#gameOver').classList.remove('visible');
  document.querySelector('#subeNivel').classList.remove('visible');

  document.querySelectorAll('.tarjeta').forEach((element) => {
    element.addEventListener('click', descubrir);
  });

  if (!modoRelax) {
    iniciaCronometro();
  } else {
    document.querySelector('#cronometro').classList.add('cronometro-oculto');
  }
}

/**
 * @brief Reinicia el juego al nivel inicial
 * @function reiniciar
 * @global
 */
function reiniciar() {
  nivelActual = 0;
  actualizaNivel();
  iniciar();
}

/**
 * @brief Inicia el juego en modo normal
 * @function iniciaJuegoNormal
 * @global
 */
function iniciaJuegoNormal() {
  modoRelax = false;
  document.querySelector('#bienvenida').classList.remove('visible');
  iniciar();
  document.querySelector('.control-nivel').classList.add('control-oculto');
}

/**
 * @brief Inicia el juego en modo relax
 * @function iniciaJuegoRelax
 * @global
 */
function iniciaJuegoRelax() {
  modoRelax = true;
  document.querySelector('#bienvenida').classList.remove('visible');
  iniciar();
}

// comienza el juego
// #region comienza el juego

// Agrega eventos al cargar la pagina
escribeNiveles();

document.querySelectorAll('.reiniciar').forEach((element) => {
  element.addEventListener('click', reiniciar);
});

document
  .querySelector('#juego-normal')
  .addEventListener('click', iniciaJuegoNormal);

document
  .querySelector('#juego-relax')
  .addEventListener('click', iniciaJuegoRelax);

document
  .querySelector('#control-nivel')
  .addEventListener('click', muestraMenuNiveles);
document
  .querySelector('#cierra-niveles')
  .addEventListener('click', ocultaMenuNiveles);

document.querySelectorAll('.nivel').forEach((element) => {
  console.log('element', element);
  element.addEventListener('click', cambiaNivel);
});

document.querySelector('#subir').addEventListener('click', cargaNuevoNivel);
document.querySelector('body').addEventListener('click', clickFueradeMenu);
document.addEventListener('keydown', teclasEscCierraMenu);

// mmostrar pantalla de Bienvenida
document.querySelector('#bienvenida').classList.add('visible');
