export class Offre {
    constructor(
        public id?: number,
        public image?: string,
        public nomSoc?: string,
        public description?: string,
        public experience?: string,
        public salaire?: string,
        public adresse?: string,
        public ville?: string,
        public specialite?: string,
        public typeContrat?: string, // Ajouté pour le type de contrat
        public datePublication?: Date // Ajouté pour la date de publication
    ) {}
}