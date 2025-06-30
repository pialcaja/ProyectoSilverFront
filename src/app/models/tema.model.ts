export interface Respuesta {
    id: number;
    contenido: string;
    fecha: string;
    autorId: number;
    autorUsername: string;
    temaId: number;
}

export interface Tema {
    id: number;
    titulo: string;
    contenido: string;
    fechaCreacion: string;
    autorId: number;
    autorUsername: string;
    respuestas: Respuesta[];
}
