import { Model, DataTypes } from "sequelize";
import { sequelize } from '../instances/pg';

//Monitoring Model
export interface ApiInstance extends Model {
    motherpos: string;
    location: string;
    position: string;
    status: string;
}

export const Api = sequelize.define<ApiInstance>('Api', {
    motherpos: {
        type: DataTypes.STRING
    },
    location: {
        type: DataTypes.STRING
    },
    position: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'monitoring',
    timestamps: false
});

//Lines Model
export interface LinesInstance extends Model {
    number: string;
    mac_line: string;
    ip_terminal: string;
}

export const Lines = sequelize.define<LinesInstance>('Lines', {
    number: {
        type: DataTypes.STRING
    },
    mac_line: {
        type: DataTypes.STRING
    },
    ip_terminal: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'lines',
    timestamps: false
});

//Mothercos Model
export interface MotherInstance extends Model {
    number: string;
    tag_code: string;
}

export const Mother = sequelize.define<MotherInstance>('Mother', {
    number: {
        type: DataTypes.STRING
    },
    tag_code: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'mothercos',
    timestamps: false
});