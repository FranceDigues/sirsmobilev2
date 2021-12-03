import { Injectable } from '@angular/core';
import { EditObjectService } from './edit-object.service';

@Injectable({
    providedIn: 'root'
})
export class FormsTemplateService {

    /**
     * This object pilote the component BaseForm that is a generic
     * component which build edition form according to the
     * formTemplatePilote object.
     */
    formTemplatePilote = {
        "AmenagementHydraulique": {
            "libelle": {
                "name": "libelle",
                "type": "EString",
                "label": "Libellé",
                "reference": false,
                "min": null
            },
            "proprietes": {
                "name": "proprietes",
                "type": "ProprieteObjet",
                "label": "Proprietes",
                "reference": true,
                "multiple": -1,
                "containment": true
            },
            "gestions": {
                "name": "gestions",
                "type": "GestionObjet",
                "label": "Gestions",
                "reference": true,
                "multiple": -1,
                "containment": true
            },
            "photos": {
                "name": "photos",
                "type": "PhotoDependance",
                "label": "Photos",
                "reference": true,
                "multiple": -1,
                "containment": true
            },
            "superficie": {
                "name": "superficie",
                "type": "EFloat",
                "label": "Superficie (m²)",
                "reference": false,
                "min": 0
            },
            "capaciteStockage": {
                "name": "capaciteStockage",
                "type": "EFloat",
                "label": "Capacité de stockage (m³)",
                "reference": false,
                "min": 0
            },
            "organismeId": {
                "name": "organismeId",
                "type": "Organisme",
                "label": "Collectivité compétente",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "profondeurMoyenne": {
                "name": "profondeurMoyenne",
                "type": "EFloat",
                "label": "Profondeur moyenne (m)",
                "reference": false,
                "min": 0
            },
            "desordreIds": {
                "name": "desordreIds",
                "type": "DesordreDependance",
                "label": "Désordres",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "structureIds": {
                "name": "structureIds",
                "type": "StructureAmenagementHydraulique",
                "label": "Structures",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "ouvrageAssocieIds": {
                "name": "ouvrageAssocieIds",
                "type": "OuvrageAssocieAmenagementHydraulique",
                "label": "Ouvrages associés",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "gestionnaireIds": {
                "name": "gestionnaireIds",
                "type": "Organisme",
                "label": "Gestionnaires",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "fonctionnementId": {
                "name": "fonctionnementId",
                "type": "RefFonctionnementAH",
                "label": "Fonctionnement",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "typeId": {
                "name": "typeId",
                "type": "RefTypeAmenagementHydraulique",
                "label": "Type",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "tronconIds": {
                "name": "tronconIds",
                "type": "TronconDigue",
                "label": "Tronçons",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "observations": {
                "name": "observations",
                "type": "ObservationDependance",
                "label": "Observations",
                "reference": true,
                "multiple": -1,
                "containment": true
            },
            "prestationIds": {
                "name": "prestationIds",
                "type": "PrestationAmenagementHydraulique",
                "label": "Prestations",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "proprietaireIds": {
                "name": "proprietaireIds",
                "type": "Contact",
                "label": "Proprietaires",
                "reference": true,
                "multiple": -1,
                "containment": false
            }
        },
        "PrestationAmenagementHydraulique": {
            "amenagementHydrauliqueId": {
                "name": "amenagementHydrauliqueId",
                "type": "AmenagementHydraulique",
                "label": "Aménagement hydraulique",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "libelle": {
                "name": "libelle",
                "type": "EString",
                "label": "Libellé",
                "reference": false,
                "min": null
            },
            "coutMetre": {
                "name": "coutMetre",
                "type": "EFloat",
                "label": "Coût au mètre (euros HT)",
                "reference": false,
                "min": 0
            },
            "coutGlobal": {
                "name": "coutGlobal",
                "type": "EFloat",
                "label": "Coût global (euros HT)",
                "reference": false,
                "min": 0
            },
            "realisationInterne": {
                "name": "realisationInterne",
                "type": "EBoolean",
                "label": "Réalisation Interne",
                "reference": false,
                "min": null
            },
            "cote": {
                "name": "cote",
                "type": "EFloat",
                "label": "Coté",
                "reference": false,
                "min": 0
            },
            "sourceId": {
                "name": "sourceId",
                "type": "RefSource",
                "label": "Source",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "mesureDiverse": {
                "name": "mesureDiverse",
                "type": "EFloat",
                "label": "Mesure Diverse",
                "reference": false,
                "min": 0
            },
            "typePrestationId": {
                "name": "typePrestationId",
                "type": "RefPrestation",
                "label": "type de prestation",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "marcheId": {
                "name": "marcheId",
                "type": "Marche",
                "label": "Marché",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "desordreIds": {
                "name": "desordreIds",
                "type": "DesordreDependance",
                "label": "Désordres",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "ouvrageAssocieAmenagementHydrauliqueIds": {
                "name": "ouvrageAssocieAmenagementHydrauliqueIds",
                "type": "OuvrageAssocieAmenagementHydraulique",
                "label": "Ouvrages associés",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "photos": {
                "name": "photos",
                "type": "PhotoDependance",
                "label": "Photos",
                "reference": true,
                "multiple": -1,
                "containment": true
            },
            "intervenantIds": {
                "name": "intervenantIds",
                "type": "Contact",
                "label": "Intervenants",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "rapportEtudeIds": {
                "name": "rapportEtudeIds",
                "type": "RapportEtude",
                "label": "Rapport d'études",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "evenementHydrauliqueIds": {
                "name": "evenementHydrauliqueIds",
                "type": "EvenementHydraulique",
                "label": "Événements hydrauliques",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "observations": {
                "name": "observations",
                "type": "ObservationDependance",
                "label": "Observations",
                "reference": true,
                "multiple": -1,
                "containment": true
            }
        },
        "StructureAmenagementHydraulique": {
            "amenagementHydrauliqueId": {
                "name": "amenagementHydrauliqueId",
                "type": "AmenagementHydraulique",
                "label": "Aménagement hydraulique",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "numCouche": {
                "name": "numCouche",
                "type": "EInt",
                "label": "Numéro de couche",
                "reference": false,
                "min": 0
            },
            "materiauId": {
                "name": "materiauId",
                "type": "RefMateriau",
                "label": "Materiau",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "observations": {
                "name": "observations",
                "type": "ObservationDependance",
                "label": "Observations",
                "reference": true,
                "multiple": -1,
                "containment": true
            },
            "sourceId": {
                "name": "sourceId",
                "type": "RefSource",
                "label": "Source",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "photos": {
                "name": "photos",
                "type": "PhotoDependance",
                "label": "Photos",
                "reference": true,
                "multiple": -1,
                "containment": true
            },
            "epaisseur": {
                "name": "epaisseur",
                "type": "EFloat",
                "label": "Épaisseur",
                "reference": false,
                "min": 0
            },
            "fonctionId": {
                "name": "fonctionId",
                "type": "RefFonction",
                "label": "Fonction",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "natureId": {
                "name": "natureId",
                "type": "RefNature",
                "label": "Nature",
                "reference": true,
                "multiple": 1,
                "containment": false
            }
        },
        "OrganeProtectionCollective": {
            "amenagementHydrauliqueId": {
                "name": "amenagementHydrauliqueId",
                "type": "AmenagementHydraulique",
                "label": "Aménagement hydraulique",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "cote": {
                "name": "cote",
                "type": "EFloat",
                "label": "Côte",
                "reference": false,
                "min": 0
            },
            "observations": {
                "name": "observations",
                "type": "ObservationDependance",
                "label": "Observations",
                "reference": true,
                "multiple": -1,
                "containment": true
            },
            "typeId": {
                "name": "typeId",
                "type": "RefTypeOrganeProtectionCollective",
                "label": "Type",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "photos": {
                "name": "photos",
                "type": "PhotoDependance",
                "label": "Photos",
                "reference": true,
                "multiple": -1,
                "containment": true
            },
            "etatId": {
                "name": "etatId",
                "type": "RefEtat",
                "label": "État",
                "reference": true,
                "multiple": 1,
                "containment": false
            }
        },
        "DesordreDependance": {
            "amenagementHydrauliqueId": {
                "name": "amenagementHydrauliqueId",
                "type": "AmenagementHydraulique",
                "label": "Aménagement hydraulique",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "dependanceId": {
                "name": "dependanceId",
                "type": "AbstractDependance",
                "label": "Dépendance",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "lieuDit": {
                "name": "lieuDit",
                "type": "EString",
                "label": "Lieu dit",
                "reference": false,
                "min": null
            },
            "cote": {
                "name": "cote",
                "type": "EFloat",
                "label": "Côte",
                "reference": false,
                "min": 0
            },
            "sourceId": {
                "name": "sourceId",
                "type": "RefSource",
                "label": "Source",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "positionId": {
                "name": "positionId",
                "type": "RefPosition",
                "label": "Position",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "categorieDesordreId": {
                "name": "categorieDesordreId",
                "type": "RefCategorieDesordre",
                "label": "Catégorie de désordre",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "typeDesordreId": {
                "name": "typeDesordreId",
                "type": "RefTypeDesordre",
                "label": "Type de désordre",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "observations": {
                "name": "observations",
                "type": "ObservationDependance",
                "label": "Observations",
                "reference": true,
                "multiple": -1,
                "containment": true
            },
            "evenementHydrauliqueIds": {
                "name": "evenementHydrauliqueIds",
                "type": "EvenementHydraulique",
                "label": "Evènements hydrauliques",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "ouvrageAssocieIds": {
                "name": "ouvrageAssocieIds",
                "type": "OuvrageAssocieAmenagementHydraulique",
                "label": "Ouvrages associés",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "prestationIds": {
                "name": "prestationIds",
                "type": "PrestationAmenagementHydraulique",
                "label": "Prestations",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "articleIds": {
                "name": "articleIds",
                "type": "ArticleJournal",
                "label": "Articles",
                "reference": true,
                "multiple": -1,
                "containment": false
            }
        },
        "OuvrageAssocieAmenagementHydraulique": {
            "amenagementHydrauliqueId": {
                "name": "amenagementHydrauliqueId",
                "type": "AmenagementHydraulique",
                "label": "Aménagement hydraulique",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "superficie": {
                "name": "superficie",
                "type": "EFloat",
                "label": "Superficie",
                "reference": false,
                "min": 0
            },
            "hauteur": {
                "name": "hauteur",
                "type": "EFloat",
                "label": "Hauteur",
                "reference": false,
                "min": 0
            },
            "profondeur": {
                "name": "profondeur",
                "type": "EFloat",
                "label": "Profondeur",
                "reference": false,
                "min": 0
            },
            "nombre": {
                "name": "nombre",
                "type": "EInt",
                "label": "Nombre",
                "reference": false,
                "min": 0
            },
            "typeId": {
                "name": "typeId",
                "type": "RefOuvrageAssocieAH",
                "label": "Type d'ouvrage",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "ouvrageDeversant": {
                "name": "ouvrageDeversant",
                "type": "EBoolean",
                "label": "Ouvrage Deversant",
                "reference": false,
                "min": null
            },
            "materiauId": {
                "name": "materiauId",
                "type": "RefMateriau",
                "label": "Materiau",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "amenagementHydrauliqueAssocieIds": {
                "name": "amenagementHydrauliqueAssocieIds",
                "type": "AmenagementHydraulique",
                "label": "Aménagements hydrauliques",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "desordreDependanceAssocieIds": {
                "name": "desordreDependanceAssocieIds",
                "type": "DesordreDependance",
                "label": "Désordres",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "proprietaireIds": {
                "name": "proprietaireIds",
                "type": "Contact",
                "label": "Proprietaires",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "gestionnaireIds": {
                "name": "gestionnaireIds",
                "type": "Organisme",
                "label": "Gestionnaires",
                "reference": true,
                "multiple": -1,
                "containment": false
            },
            "observations": {
                "name": "observations",
                "type": "ObservationDependance",
                "label": "Observations",
                "reference": true,
                "multiple": -1,
                "containment": true
            },
            "photos": {
                "name": "photos",
                "type": "PhotoDependance",
                "label": "Photos",
                "reference": true,
                "multiple": -1,
                "containment": true
            },
            "numCouche": {
                "name": "numCouche",
                "type": "EInt",
                "label": "Numéro de couche",
                "reference": false,
                "min": 0
            },
            "sourceId": {
                "name": "sourceId",
                "type": "RefSource",
                "label": "Source",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "diametre": {
                "name": "diametre",
                "type": "EFloat",
                "label": "Diamètre",
                "reference": false,
                "min": 0
            },
            "cote": {
                "name": "cote",
                "type": "EFloat",
                "label": "Côte",
                "reference": false,
                "min": 0
            },
            "section": {
                "name": "section",
                "type": "EFloat",
                "label": "Section",
                "reference": false,
                "min": 0
            },
            "etatId": {
                "name": "etatId",
                "type": "RefEtat",
                "label": "État",
                "reference": true,
                "multiple": 1,
                "containment": false
            },
            "fonctionnementId": {
                "name": "fonctionnementId",
                "type": "RefFonctionnementOAAH",
                "label": "Fonctionnement",
                "reference": true,
                "multiple": 1,
                "containment": false
            }
        },
        "Prestation": {
            "borneDebutId": {
              "name": "borneDebutId",
              "type": "BorneDigue",
              "label": "Borne de début",
              "reference": true,
              "multiple": 1,
              "containment": false
            },
            "borne_debut_aval": {
              "name": "borne_debut_aval",
              "type": "EBoolean",
              "label": "En amont de la borne de début",
              "reference": false,
              "min": null
            },
            "borne_debut_distance": {
              "name": "borne_debut_distance",
              "type": "EDouble",
              "label": "Distance (borne début)",
              "reference": false,
              "min": null
            },
            "positionDebut": {
              "name": "positionDebut",
              "type": "Point",
              "label": "Position de début",
              "reference": false,
              "min": null
            },
            "prDebut": {
              "name": "prDebut",
              "type": "EFloat",
              "label": "PR de début",
              "reference": false,
              "min": 0
            },
            "borneFinId": {
              "name": "borneFinId",
              "type": "BorneDigue",
              "label": "Borne de fin",
              "reference": true,
              "multiple": 1,
              "containment": false
            },
            "borne_fin_aval": {
              "name": "borne_fin_aval",
              "type": "EBoolean",
              "label": "En amont de la borne de fin",
              "reference": false,
              "min": null
            },
            "borne_fin_distance": {
              "name": "borne_fin_distance",
              "type": "EDouble",
              "label": "Distance (borne fin)",
              "reference": false,
              "min": null
            },
            "positionFin": {
              "name": "positionFin",
              "type": "Point",
              "label": "Position de fin",
              "reference": false,
              "min": null
            },
            "prFin": {
              "name": "prFin",
              "type": "EFloat",
              "label": "PR de fin",
              "reference": false,
              "min": 0
            },
            "systemeRepId": {
              "name": "systemeRepId",
              "type": "SystemeReperage",
              "label": "Système de repérage",
              "reference": true,
              "multiple": 1,
              "containment": false
            },
            "longitudeMin": {
              "name": "longitudeMin",
              "type": "EDouble",
              "label": "Longitude min",
              "reference": false,
              "min": null
            },
            "longitudeMax": {
              "name": "longitudeMax",
              "type": "EDouble",
              "label": "Longitude max",
              "reference": false,
              "min": null
            },
            "latitudeMin": {
              "name": "latitudeMin",
              "type": "EDouble",
              "label": "Latitude min",
              "reference": false,
              "min": null
            },
            "latitudeMax": {
              "name": "latitudeMax",
              "type": "EDouble",
              "label": "Latitude max",
              "reference": false,
              "min": null
            },
            "geometryMode": {
              "name": "geometryMode",
              "type": "EString",
              "label": "geometry Mode",
              "reference": false,
              "min": null
            },
            "editedGeoCoordinate": {
              "name": "editedGeoCoordinate",
              "type": "EBooleanObject",
              "label": "Coordonnées Geo éditées",
              "reference": false,
              "min": null
            },
            "linearId": {
              "name": "linearId",
              "type": "TronconDigue",
              "label": "Tronçon",
              "reference": true,
              "multiple": 1,
              "containment": false
            },
            "photos": {
              "name": "photos",
              "type": "Photo",
              "label": "Photos",
              "reference": true,
              "multiple": -1,
              "containment": true
            },
            "libelle": {
              "name": "libelle",
              "type": "EString",
              "label": "Libellé",
              "reference": false,
              "min": null
            },
            "coutMetre": {
              "name": "coutMetre",
              "type": "EFloat",
              "label": "Coût au mètre Tronçon (euros HT)",
              "reference": false,
              "min": 0
            },
            "coutGlobal": {
              "name": "coutGlobal",
              "type": "EFloat",
              "label": "Coût global (euros HT)",
              "reference": false,
              "min": 0
            },
            "realisationInterne": {
              "name": "realisationInterne",
              "type": "EBoolean",
              "label": "Réalisation interne",
              "reference": false,
              "min": null
            },
            "coteId": {
              "name": "coteId",
              "type": "RefCote",
              "label": "Côté",
              "reference": true,
              "multiple": 1,
              "containment": false
            },
            "positionId": {
              "name": "positionId",
              "type": "RefPosition",
              "label": "Position",
              "reference": true,
              "multiple": 1,
              "containment": false
            },
            "sourceId": {
              "name": "sourceId",
              "type": "RefSource",
              "label": "Source",
              "reference": true,
              "multiple": 1,
              "containment": false
            },
            "typePrestationId": {
              "name": "typePrestationId",
              "type": "RefPrestation",
              "label": "Type de prestation",
              "reference": true,
              "multiple": 1,
              "containment": false
            },
            "marcheId": {
              "name": "marcheId",
              "type": "Marche",
              "label": "Marché",
              "reference": true,
              "multiple": 1,
              "containment": false
            },
            "desordreIds": {
              "name": "desordreIds",
              "type": "Desordre",
              "label": "Désordres",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "evenementHydrauliqueIds": {
              "name": "evenementHydrauliqueIds",
              "type": "EvenementHydraulique",
              "label": "évènements hydrauliques",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "intervenantsIds": {
              "name": "intervenantsIds",
              "type": "Contact",
              "label": "Intervenants",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "rapportEtudeIds": {
              "name": "rapportEtudeIds",
              "type": "RapportEtude",
              "label": "Rapport d'étude",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "documentGrandeEchelleIds": {
              "name": "documentGrandeEchelleIds",
              "type": "DocumentGrandeEchelle",
              "label": "Document à grande échelle",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "observations": {
              "name": "observations",
              "type": "ObservationPrestation",
              "label": "observations",
              "reference": true,
              "multiple": -1,
              "containment": true
            },
            "echelleLimnimetriqueIds": {
              "name": "echelleLimnimetriqueIds",
              "type": "EchelleLimnimetrique",
              "label": "Echelles Limnimetriques",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "ouvrageParticulierIds": {
              "name": "ouvrageParticulierIds",
              "type": "OuvrageParticulier",
              "label": "Ouvrages Particuliers",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "reseauTelecomEnergieIds": {
              "name": "reseauTelecomEnergieIds",
              "type": "ReseauTelecomEnergie",
              "label": "Réseaux Telecom Energie",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "ouvrageTelecomEnergieIds": {
              "name": "ouvrageTelecomEnergieIds",
              "type": "OuvrageTelecomEnergie",
              "label": "Ouvrages Telecom Energie",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "ouvrageHydrauliqueAssocieIds": {
              "name": "ouvrageHydrauliqueAssocieIds",
              "type": "OuvrageHydrauliqueAssocie",
              "label": "ouvrages Hydrauliques Associés",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "reseauHydrauliqueFermeIds": {
              "name": "reseauHydrauliqueFermeIds",
              "type": "ReseauHydrauliqueFerme",
              "label": "Reseaux Hydrauliques Fermés",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "reseauHydrauliqueCielOuvertIds": {
              "name": "reseauHydrauliqueCielOuvertIds",
              "type": "ReseauHydrauliqueCielOuvert",
              "label": "Reseaux Hydrauliques à Ciel Ouvert",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "stationPompageIds": {
              "name": "stationPompageIds",
              "type": "StationPompage",
              "label": "Station de Pompages",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "ouvrageVoirieIds": {
              "name": "ouvrageVoirieIds",
              "type": "OuvrageVoirie",
              "label": "Ouvrages de Voirie",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "voieDigueIds": {
              "name": "voieDigueIds",
              "type": "VoieDigue",
              "label": "Voies Digues",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "ouvertureBatardableIds": {
              "name": "ouvertureBatardableIds",
              "type": "OuvertureBatardable",
              "label": "Ouvertures Batardables",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "voieAccesIds": {
              "name": "voieAccesIds",
              "type": "VoieAcces",
              "label": "Voies d'Accès",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "ouvrageFranchissementIds": {
              "name": "ouvrageFranchissementIds",
              "type": "OuvrageFranchissement",
              "label": "Ouvrages de Franchissements",
              "reference": true,
              "multiple": -1,
              "containment": false
            },
            "globalPrestationIds": {
              "name": "globalPrestationIds",
              "type": "GlobalPrestation",
              "label": "Prestations Globales",
              "reference": true,
              "multiple": -1,
              "containment": false
            }
          }        
    }

    constructor(private EOS: EditObjectService) { }

    initTalus() {
        this.initMateriauHaut();
        this.initMateriauBas();
        this.initNatureHaut();
        this.initNatureBas();
        this.initTopThickness();
        this.initInnerSlope();
        this.initTopLength();
        this.initLowLength();
        this.initTopFunction();
        this.initLowFunction();
        this.initCote();
    }

    initCategorie() {
        this.EOS.setupRef('categorieDesordreId', this.EOS.refs.RefCategorieDesordre[0]);
    }

    initCote() {
        this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
    }

    initDamPosition() {
        this.initPosition();
    }

    initDamSide() {
        this.initCote();
    }

    initFunction() {
        this.EOS.setupRef('fonctionId', this.EOS.refs.RefFonction[0]);
    }

    initGlissiere() {
        this.EOS.setupRef('typeGlissiereId', this.EOS.refs.RefTypeGlissiere[0]);
    }

    initHeightRef() {
        this.EOS.setupRef('referenceHauteurId', this.EOS.refs.RefReferenceHauteur[0]);
    }

    initInnerSlope() {
        this.EOS.objectDoc.penteInterieure = this.EOS.objectDoc.penteInterieure || 0;
    }

    initMaterial() {
        this.EOS.setupRef('materiauId', this.EOS.refs.RefMateriau[0]);
    }

    initMateriauHaut() {
        this.EOS.setupRef('materiauHautId', this.EOS.refs.RefMateriau[0]);
    }

    initMateriauBas() {
        this.EOS.setupRef('materiauBasId', this.EOS.refs.RefMateriau[0]);
    }

    initNature() {
        this.EOS.setupRef('natureId', this.EOS.refs.RefNature[0]);
    }

    initNatureHaut() {
        this.EOS.setupRef('natureHautId', this.EOS.refs.RefNature[0]);
    }

    initNatureBas() {
        this.EOS.setupRef('natureBasId', this.EOS.refs.RefNature[0]);
    }

    initOrientationOuvrage() {
        this.EOS.setupRef('orientationOuvrageId', this.EOS.refs.RefOrientationOuvrage[0]);
    }

    initOuvrageRevanche() {
        this.EOS.setupRef('ouvrageRevancheIds', this.EOS.refs.OuvrageRevanche[0], true);
    }

    initTopThickness() {
        this.EOS.objectDoc.epaisseurSommet = this.EOS.objectDoc.epaisseurSommet || 0;
    }

    initTopLength() {
        this.EOS.objectDoc.longueurRampantHaut = this.EOS.objectDoc.longueurRampantHaut || 0;
    }

    initLowLength() {
        this.EOS.objectDoc.longueurRampantBas = this.EOS.objectDoc.longueurRampantBas || 0;
    }

    initRevetementHaut() {
        this.EOS.setupRef('revetementHautId', this.EOS.refs.RefRevetement[0]);
    }

    initRevetementBas() {
        this.EOS.setupRef('revetementBasId', this.EOS.refs.RefRevetement[0]);
    }

    initSeuil() {
        this.EOS.setupRef('typeSeuilId', this.EOS.refs.RefSeuil[0]);
    }

    initTopFunction() {
        this.EOS.setupRef('fonctionHautId', this.EOS.refs.RefFonction[0]);
    }

    initTypeOuvrage() {
        this.EOS.setupRef('typeOuvrageFranchissementId', this.EOS.refs.RefOuvrageFranchissement[0]);
    }

    initUsage() {
        this.EOS.setupRef('usageId', this.EOS.refs.RefUsageVoie[0]);
    }

    initPosition() {
        this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
    }

    initPositionHaut() {
        this.EOS.setupRef('positionHautId', this.EOS.refs.RefPosition[0]);
    }

    initPositionBas() {
        this.EOS.setupRef('positionBasId', this.EOS.refs.RefPosition[0]);
    }

    initHeight() {
        this.EOS.objectDoc.hauteurMurette = this.EOS.objectDoc.hauteurMurette || 0;
    }

    initWidth() {
        this.EOS.objectDoc.epaisseur = this.EOS.objectDoc.epaisseur || 0;
    }

    initLowFunction() {
        this.EOS.setupRef('fonctionBasId', this.EOS.refs.RefFonction[0]);
    }

    initFonctionnementAH() {
        this.EOS.setupRef('fonctionnementId', this.EOS.refs.RefFonctionnementAH[0]);
    }

    initTypeAH() {
        this.EOS.setupRef('typeId', this.EOS.refs.RefTypeAmenagementHydraulique[0]);
    }

    initTypeOrganeProtectionCollective() {
        this.EOS.setupRef('typeId', this.EOS.refs.RefTypeOrganeProtectionCollective[0]);
    }

    initEtat() {
        this.EOS.setupRef('etatId', this.EOS.refs.RefEtat[0]);
    }

    initOuvrageAssocieAH() {
        this.EOS.setupRef('typeId', this.EOS.refs.RefOuvrageAssocieAH[0]);
    }

    initFonctionnementOAAH() {
        this.EOS.setupRef('fonctionnementId', this.EOS.refs.RefFonctionnementOAAH[0]);
    }


    doc2String(doc) {
        if (this.EOS.showTextConfig === "fullName") {
            return doc.libelle ? doc.libelle : "libellé indéterminé / id:  " + doc._id
        } else if (this.EOS.showTextConfig === "abstract") {
            if (doc.abrege) {
                return doc.abrege;
            } else {
                let libelle = doc.libelle ? doc.libelle : "libellé indéterminé";
                let designation = doc.designation ? doc.designation : "designation indéterminée";
                return designation + " : " + libelle;
            }
        } else if (this.EOS.showTextConfig === "both") {
            let libelle = doc.libelle ? doc.libelle : "libellé indéterminé";
            if (doc.abrege) {
                return doc.abrege + " : " + libelle;
            } else {
                let designation = doc.designation ? doc.designation : "désignation indéterminée";
                return designation + " : " + libelle;
            }
        } else {
            let libelle = doc.libelle ? doc.libelle : "libellé indéterminé";
            if (doc.abrege) {
                return doc.abrege + " : " + libelle;
            } else {
                if (!doc.libelle && !doc.designation) {
                    return "id: " + doc._id;
                } else {
                    let designation = doc.designation ? doc.designation : "désignation indéterminée";
                    return designation + " : " + libelle;
                }
            }
        }
    }
}
