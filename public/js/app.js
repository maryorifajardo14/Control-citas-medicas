const API_BASE = '/api';

const ESTADO_COLORES = {
    pendiente: '#f59e0b',
    confirmada: '#2563eb',
    cancelada: '#ef4444',
    atendida: '#16a34a'
};

const TRANSICIONES_ESTADO = {
    pendiente: [
        { estado: 'confirmada', etiqueta: 'Confirmar' },
        { estado: 'cancelada', etiqueta: 'Cancelar' }
    ],
    confirmada: [
        { estado: 'atendida', etiqueta: 'Marcar como atendida' },
        { estado: 'cancelada', etiqueta: 'Cancelar' }
    ],
    cancelada: [],
    atendida: []
};

let calendar;
let citaSeleccionadaId = null;

async function apiFetch(url, options = {}) {
    const respuesta = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    const cuerpo = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
        const error = new Error(cuerpo.message || 'Ocurrio un error inesperado');
        error.status = respuesta.status;
        throw error;
    }
    return cuerpo;
}

function abrirModal(id) {
    document.getElementById(id).hidden = false;
}

function cerrarModal(id) {
    document.getElementById(id).hidden = true;
}

function mostrarError(idMensaje, error) {
    const el = document.getElementById(idMensaje);
    el.textContent = error.status === 409
        ? `Conflicto de horario: ${error.message}`
        : error.message;
    el.hidden = false;
}

function ocultarError(idMensaje) {
    const el = document.getElementById(idMensaje);
    el.hidden = true;
    el.textContent = '';
}

function mapCitaAEvento(cita) {
    return {
        id: String(cita.id),
        title: `${cita.paciente_nombre} - ${cita.doctor_nombre}`,
        start: cita.inicio,
        end: cita.fin,
        backgroundColor: ESTADO_COLORES[cita.estado],
        borderColor: ESTADO_COLORES[cita.estado],
        extendedProps: { ...cita }
    };
}

async function cargarDoctoresYPacientes() {
    const [doctores, pacientes] = await Promise.all([
        apiFetch(`${API_BASE}/doctores`),
        apiFetch(`${API_BASE}/pacientes`)
    ]);

    const selectFiltro = document.getElementById('filtro-doctor');
    const selectCrearDoctor = document.getElementById('crear-doctor');
    const selectCrearPaciente = document.getElementById('crear-paciente');

    doctores.forEach((doctor) => {
        const nombre = `${doctor.nombre} ${doctor.apellido} (${doctor.especialidad})`;
        selectFiltro.appendChild(new Option(nombre, doctor.id));
        selectCrearDoctor.appendChild(new Option(nombre, doctor.id));
    });

    pacientes.forEach((paciente) => {
        const nombre = `${paciente.nombre} ${paciente.apellido}`;
        selectCrearPaciente.appendChild(new Option(nombre, paciente.id));
    });
}

async function obtenerEventos(fetchInfo, successCallback, failureCallback) {
    try {
        const params = new URLSearchParams({
            desde: fetchInfo.startStr,
            hasta: fetchInfo.endStr
        });
        const doctorId = document.getElementById('filtro-doctor').value;
        if (doctorId) {
            params.set('doctor_id', doctorId);
        }
        const citas = await apiFetch(`${API_BASE}/citas?${params.toString()}`);
        successCallback(citas.map(mapCitaAEvento));
    } catch (error) {
        failureCallback(error);
    }
}

function formatearHorario(inicio, fin) {
    const opciones = { dateStyle: 'medium', timeStyle: 'short' };
    const fmt = new Intl.DateTimeFormat('es-DO', opciones);
    return `${fmt.format(new Date(inicio.replace(' ', 'T')))} - ${fmt.format(new Date(fin.replace(' ', 'T')))}`;
}

function mostrarDetalleCita(cita) {
    citaSeleccionadaId = cita.id;
    document.getElementById('detalle-paciente').textContent = cita.paciente_nombre;
    document.getElementById('detalle-doctor').textContent = cita.doctor_nombre;
    document.getElementById('detalle-horario').textContent = formatearHorario(cita.inicio, cita.fin);
    document.getElementById('detalle-motivo').textContent = cita.motivo;
    document.getElementById('detalle-estado').textContent = cita.estado;
    ocultarError('detalle-error');

    const contenedorAcciones = document.getElementById('detalle-acciones-estado');
    contenedorAcciones.innerHTML = '';
    TRANSICIONES_ESTADO[cita.estado].forEach(({ estado, etiqueta }) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'btn-estado';
        boton.textContent = etiqueta;
        boton.addEventListener('click', () => cambiarEstadoCita(estado));
        contenedorAcciones.appendChild(boton);
    });

    abrirModal('modal-detalle');
}

async function cambiarEstadoCita(nuevoEstado) {
    try {
        await apiFetch(`${API_BASE}/citas/${citaSeleccionadaId}/estado`, {
            method: 'PATCH',
            body: JSON.stringify({ estado: nuevoEstado })
        });
        cerrarModal('modal-detalle');
        calendar.refetchEvents();
    } catch (error) {
        mostrarError('detalle-error', error);
    }
}

function abrirModalCrear(fechaInicio) {
    ocultarError('crear-error');
    document.getElementById('form-crear-cita').reset();

    if (fechaInicio) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(inicio.getTime() + 30 * 60 * 1000);
        document.getElementById('crear-inicio').value = aInputLocal(inicio);
        document.getElementById('crear-fin').value = aInputLocal(fin);
    }

    abrirModal('modal-crear');
}

function aInputLocal(fecha) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

async function manejarEnvioCrearCita(evento) {
    evento.preventDefault();
    ocultarError('crear-error');

    const datos = {
        pacienteId: document.getElementById('crear-paciente').value,
        doctorId: document.getElementById('crear-doctor').value,
        inicio: document.getElementById('crear-inicio').value,
        fin: document.getElementById('crear-fin').value,
        motivo: document.getElementById('crear-motivo').value
    };

    try {
        await apiFetch(`${API_BASE}/citas`, {
            method: 'POST',
            body: JSON.stringify(datos)
        });
        cerrarModal('modal-crear');
        calendar.refetchEvents();
    } catch (error) {
        mostrarError('crear-error', error);
    }
}

async function manejarArrastreOEvento(info) {
    try {
        await apiFetch(`${API_BASE}/citas/${info.event.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                inicio: info.event.startStr,
                fin: info.event.endStr
            })
        });
        calendar.refetchEvents();
    } catch (error) {
        alert(error.status === 409 ? `Conflicto de horario: ${error.message}` : error.message);
        info.revert();
    }
}

function inicializarModales() {
    document.querySelectorAll('[data-cerrar-modal]').forEach((boton) => {
        boton.addEventListener('click', () => cerrarModal(boton.dataset.cerrarModal));
    });
    document.getElementById('btn-nueva-cita').addEventListener('click', () => abrirModalCrear(new Date()));
    document.getElementById('form-crear-cita').addEventListener('submit', manejarEnvioCrearCita);
    document.getElementById('filtro-doctor').addEventListener('change', () => calendar.refetchEvents());
}

function inicializarCalendario() {
    const el = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(el, {
        locale: 'es',
        height: 'auto',
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        selectable: true,
        editable: true,
        eventDurationEditable: true,
        events: obtenerEventos,
        dateClick: (info) => abrirModalCrear(info.date),
        eventClick: (info) => mostrarDetalleCita(info.event.extendedProps),
        eventDrop: manejarArrastreOEvento,
        eventResize: manejarArrastreOEvento
    });
    calendar.render();
}

document.addEventListener('DOMContentLoaded', async () => {
    inicializarModales();
    inicializarCalendario();
    try {
        await cargarDoctoresYPacientes();
    } catch (error) {
        console.error('No se pudieron cargar doctores/pacientes', error);
    }
});
