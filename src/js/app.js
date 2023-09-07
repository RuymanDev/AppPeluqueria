let paso = 1;
const pasoInicial = 1;
const pasofinal = 3;

const cita = {
    id: '',
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
};

let fechas = [];

const horas = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
]

document.addEventListener('DOMContentLoaded', function () {
    iniciarApp();
});


function iniciarApp() {

    mostrarSeccion(); // Muestra y oculta las secciones
    tabs(); // Cambia la seccion cuando se presionen los tabs
    botonesPaginador(); // Agrega o quita los botones del paginador
    paginaAnterior();
    paginaSiguiente();

    consultarAPI(); // Consulta la API en el backend de PHP
    consultarAPIFechas(); // Consulta la API de fechas y horas de citas existentes

    idCliente(); // Añade el id del cliente al objeto de cita
    nombreCliente(); // Añade el nombre del cliente al objeto de cita
    seleccionarFecha(); //Añade la fecha de la cita en el objeto
    seleccionarHora(); //Añade la hora de la cita en el objeto

    mostrarResumen(); // Muestra el resumen de la cita
}

function mostrarSeccion() {
    // Ocultar la seccion que tenga la clase de mostrar
    const seccionAnterior = document.querySelector('.mostrar');
    if (seccionAnterior) {
        seccionAnterior.classList.remove('mostrar');
    }

    // Seleccionar la seccion con el paso...
    const pasoSelector = `#paso-${ paso }`;
    const seccion = document.querySelector(pasoSelector);
    seccion.classList.add('mostrar');

    // Quita la clase de actual al tab anterior
    const tabAnterior = document.querySelector('.actual');
    if (tabAnterior) {
        tabAnterior.classList.remove('actual');
    }

    // Resalta el tab actual
    const tab = document.querySelector(`[data-paso="${ paso }"]`);
    tab.classList.add('actual');

}

function tabs() {

    const botones = document.querySelectorAll('.tabs button');

    botones.forEach(boton => {
        boton.addEventListener('click', function (e) {
            paso = parseInt(e.target.dataset.paso);
            mostrarSeccion();

            botonesPaginador();
        });
    });
}

function botonesPaginador() {
    // Registrar botones
    const paginaAnterior = document.querySelector('#anterior');
    const paginaSiguiente = document.querySelector('#siguiente');

    // Ocultar los botones segun el paso
    if (paso === 1) {
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');

    } else if (paso === 3) {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.add('ocultar');
        mostrarResumen();

    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }

    mostrarSeccion();
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', function () {

        if (paso <= pasoInicial) return;

        paso--;

        botonesPaginador()
    });
}

function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', function () {

        if (paso >= pasofinal) return;

        paso++;

        botonesPaginador()
    });
}

async function consultarAPI() {
    try {

        // const url = '/api/servicios'; // backend y JS en el mismo dominio
        const url = `${location.origin}/api/servicios`; // Usar la URL principal con la api de location
        // const url = 'http://localhost:3000/api/servicios'; // URL por defecto en la creacion de la APP
        // const url = 'http://127.0.0.1:3000/api/servicios'; // Para Thunder Client en vez de Postman
        const resultado = await fetch(url); // Espera hasta que descarge los servicios

        const servicios = await resultado.json();
        mostrarServicios(servicios);

    } catch (error) {
        // console.log(error);
    }
}

async function consultarAPIFechas(){
    try {
        const url = `${location.origin}/api/fechas`; // Usar la URL principal con la api de location

        const resultado = await fetch(url);

        fechas = await resultado.json() ?? '';

    } catch (error) {
        console.log(error);
    }
}

function mostrarServicios(servicios) {
    servicios.forEach(servicio => {
        const { id, nombre, precio } = servicio;

        const nombreServicio = document.createElement('P');
        nombreServicio.classList.add('nombre-servicio');
        nombreServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.classList.add('precio-servicio');
        precioServicio.textContent = `${ precio } €`;

        const servicioDiv = document.createElement('DIV');
        servicioDiv.classList.add('servicio');
        servicioDiv.dataset.idServicio = id; // Atributo propio
        servicioDiv.onclick = function () {
            seleccionarServicio(servicio);
        };

        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);


        document.querySelector('#servicios').appendChild(servicioDiv);

    });
}

function seleccionarServicio(servicio) {
    const { id } = servicio;
    const { servicios } = cita; // Extraer el arreglo de servicios

    // Identificar al elemento que se le da clic
    const divServicio = document.querySelector(`[data-id-servicio="${ id }"]`);

    // Comprobar si un servicio ya fue agregado
    if (servicios.some(agregado => agregado.id === id)) {
        // Eliminarlo
        cita.servicios = servicios.filter(agregado => agregado.id !== id);
        divServicio.classList.remove('seleccionado');
    } else {
        // Agregarlo
        cita.servicios = [...servicios, servicio]; // Tomo una copia del arreglo de servicios y le agrego el nuevo objeto de servicio al final
        divServicio.classList.add('seleccionado');
    }

}

function idCliente() {
    const id = document.querySelector('#id').value;
    cita.id = id;
}

function nombreCliente() {
    const nombre = document.querySelector('#nombre').value;
    cita.nombre = nombre;
}

function seleccionarFecha() {
    const inputFecha = document.querySelector('#fecha');
    inputFecha.addEventListener('input', function (e) {

        const dia = new Date(e.target.value).getUTCDay();

        if ([6, 0].includes(dia)) {
            e.target.value = '';
            mostrarAlerta('Fines de Semana no permitidos', 'error', '.formulario');

        } else {
            cita.fecha = e.target.value;
            fechas[cita.fecha];

            seleccionarHora();
        }
    });
}

function seleccionarHora() {
    const inputHora = document.querySelector('#hora');

    comprobarFecha(inputHora);

    // Si existe la fecha guardamos la hora con los minutos, sin los segundos
    if( fechas[cita.fecha] ){ 
        for( let i=0; i<fechas[cita.fecha].length ; i++){
            hora = fechas[cita.fecha][i].split(":")
            fechas[cita.fecha][i] = hora[0] + ":" + hora[1];
        }
    }


    deshabilitarHoras();

    inputHora.addEventListener('input', function (e) {
        const horaCita = e.target.value;
        const hora = horaCita.split(':')[0];

        if (hora < 9 || hora > 18) {
            e.target.value = '';
            mostrarAlerta('Hora no válida', 'error', '.formulario');

        } else {
            cita.hora = e.target.value;
        }
    });
}

function comprobarFecha(inputHora) {
    // Si no se ha seleccionado una fecha no se puede seleccionar una hora
    if (cita.fecha.length === 0){
        inputHora.setAttribute('disabled', '');
        return;
    } 
    
    if(fechas[cita.fecha] && fechas[cita.fecha].length === horas.length){
        inputHora.setAttribute('disabled', '');
        mostrarAlerta('Este dia tiene todas las horas ocupadas', 'error', '.formulario');
        return;
    }

    inputHora.removeAttribute('disabled');
}

function deshabilitarHoras(){
    const select = document.querySelector('#hora');

    // Si hay opciones anteriores las eliminamos
    if( select.options ){
        select.replaceChildren();
    }

    let esHoy = comprobarSiEsHoy();
    const date = new Date;
    const hora = date.getHours();

    let i = -1;
    while (i < horas.length) {
        const option = document.createElement('OPTION');

        // Si es el primero se crea la opcion por defecto de seleccionar hora
        if( i === -1){
            option.textContent = '-- Seleccionar Hora --';
            option.setAttribute('disabled', '');
            option.setAttribute('selected', 'selected');
            select.appendChild(option);
            i++;
            continue;
        }

        // Añadimos las horas al option
        option.textContent = horas[i];
        option.value = horas[i];

        // Si es hoy desabilito las horas anteriores a la actual y una hora despues
        // para que no pueda seleccionar una hora justo un minuto antes
        if(esHoy && parseInt(horas[i]) < hora + 1) {
            option.setAttribute('disabled', '');
        }

        // Si estan todas las fechas ocupadas deshabilitamos seleccionar horas
        if( fechas[cita.fecha] && fechas[cita.fecha].includes(horas[i]) ){
            option.textContent += ' Reservado';
            option.setAttribute('disabled', '');
            
        } 

        select.appendChild(option)
        i++;
    }
}

function comprobarSiEsHoy(){
    fechaActual = new Date()

    let añoActual = fechaActual.getFullYear();
    let hoy = fechaActual.getDate();
    let mesActual = fechaActual.getMonth() + 1;

    if(hoy < 10){
        hoy = "0" + hoy;
    }
    if(mesActual < 10){
        mesActual = "0" + mesActual;
    }

    fechaActual = añoActual +"-"+ mesActual +"-"+ hoy;

    if (fechaActual === cita.fecha) {
        return true;
    }
    return false;

}

function mostrarAlerta(mensaje, tipo, elemento, desaparece = true) {
    // Previene que se generen mas de una alerta
    const alertaPrevia = document.querySelector('.alerta');
    if (alertaPrevia) {
        alertaPrevia.remove();
    }

    // Scripting para crear la alerta
    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');
    alerta.classList.add(tipo);

    const referencia = document.querySelector(elemento);
    referencia.appendChild(alerta);

    if (desaparece) {
        // Eliminar la alerta
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
}

function mostrarResumen() {
    const resumen = document.querySelector('.contenido-resumen');

    // Limpiar el Contenido de Resumen
    while (resumen.firstChild) {
        resumen.removeChild(resumen.firstChild)
    }

    if (Object.values(cita).includes('') || cita.servicios.length === 0) {
        mostrarAlerta('Faltan datos de Servicios, Fecha u Hora', 'error', '.contenido-resumen', false)

        return;
    }

    // Formatear el div de resumen
    const { nombre, fecha, hora, servicios } = cita;


    // Heading para Servicios en Resumen
    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';
    resumen.appendChild(headingServicios);

    // Variable para el precio total
    let total = 0;

    // Iterando y mostrando los Servicios
    servicios.forEach(servicio => {
        const { id, precio, nombre } = servicio

        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.innerHTML = `<span>Precio</span> ${ precio } €`;

        // Sumar el precio al total
        total += parseInt(precio); 
        
        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        resumen.appendChild(contenedorServicio);
    });

    // Heading para Cita en Resumen
    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita';
    resumen.appendChild(headingCita);

    // Información de la cita
    const nombreCliente = document.createElement('P');
    nombreCliente.innerHTML = `<span>Nombre:</span> ${ nombre }`;

    // Formatear fecha
    const fechaFormateada = formatearFecha(fecha);

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${ fechaFormateada }`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${ hora }`;


    const totalPrecio = document.createElement('P');
    totalPrecio.innerHTML = `<span>Total:</span> ${ total } €`;

    // Boton para Crear una Cita 
    const botonReservar = document.createElement('BUTTON');
    botonReservar.classList.add('boton');
    botonReservar.textContent = 'Reservar Cita';
    botonReservar.onclick = reservarCita;

    resumen.appendChild(nombreCliente);
    resumen.appendChild(fechaCita);
    resumen.appendChild(horaCita);
    resumen.appendChild(totalPrecio);

    resumen.append(botonReservar);
}

function formatearFecha(fecha) {
    // Formatear la fecha en español
    const fechaObj = new Date(fecha);
    const mes = fechaObj.getMonth();
    const dia = fechaObj.getDate();
    const year = fechaObj.getFullYear();

    const fechaUTC = new Date(Date.UTC(year, mes, dia));

    const opciones = {
        weekday: 'long', // Dia de la semana, long es el nombre largo, Lunes, Martes
        year: 'numeric',
        month: 'long',
        day: 'numeric' // Dia del mes en formato de numero
    };
    const fechaFormateada = fechaUTC.toLocaleDateString('es-ES', opciones);

    return fechaFormateada;
}

async function reservarCita() {

    const { id, fecha, hora, servicios } = cita;

    const idServicios = servicios.map(servicio => servicio.id);


    const datos = new FormData();

    datos.append('fecha', fecha);
    datos.append('hora', hora);
    datos.append('usuarioId', id);
    datos.append('servicios', idServicios);



    try {
        // Peticion hacia la API

        const url = `${location.origin}/api/citas`; // Usar la URL principal con la api de location 
        // const url = '/api/citas';


        const respuesta = await fetch(url, {
            method: 'POST',
            body: datos
        });

        const resultado = await respuesta.json();
        // console.log(resultado);

        if ( resultado.resultado ) { // True o False
            Swal.fire({
                icon: 'success',
                title: 'Cita Creada',
                text: 'Tu Cita fue creada correctamente',
                button: 'Ok'
            }).then(() => {
                setTimeout(() => {
                    window.location.reload();

                }, 3000);
            });
        }

    } catch (error) {

        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al guardar la cita',
        });
    }

    // console.log([...datos]);
}