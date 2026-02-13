export interface IdiomaDaDoencaData {
    meta: Meta;
    elements: Elements;
}

export interface Meta {
    version: string;
    source: string;
    author: string;
}

export interface Elements {
    wood: ElementData;
    fire: ElementData;
    earth: ElementData;
    metal: ElementData;
    water: ElementData;
}

export interface ElementData {
    name: string;
    color: string;
    organs: string[];
    facial_zones: FacialZone[];
}

export interface FacialZone {
    id: string;
    name: string;
    symptom_match: string[];
    translation: Translation;
}

export interface Translation {
    root_emotion: string;
    message: string;
    healing_emotion: string;
}
