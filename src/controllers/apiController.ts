import { Request, Response } from "express";
import { Api, Lines, Mother } from '../models/Api';
import { Op } from 'sequelize';
import moment from 'moment';
import axios from 'axios';
import io from '../server';

let machines: any = [];

const Reload: any = () => {
    if(machines.length > 0){
        machines.forEach((mach: any) => {
            if(mach != null){
                io.emit('Status', { motherpos: mach.motherpos, location: mach.location.toLowerCase().replace(' ', ''), position: mach.position, status: 'input' });
            }
        });
    }
};

const verify: any = async (line: any, pos: any) => {
    let read;

    let config;
    
    if(pos == 'Security'){
        config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `http://${line}:8080/getTagSDCard`,
            headers: {}
        };
    }else{
        config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `http://${line}/getTagList.php?antenna=${pos}&last=1`,
            headers: {}
        };
    }

    await axios(config)
    .then(function (response) {
        read = response.data;
    })
    .catch((error) => {
        read = undefined;
    })

    return read;
};

setInterval(async () => {
    const lines: any = await Lines.findAll({
        order: [['number', 'ASC']]
    });

    if(lines.length > 0){
        lines.forEach(async (item: any) => {
            //começa aqui o da sala segura
            if(item.number == 'Security'){

                const setMachine = new Set();

                let machine = await verify(item.ip_terminal, item.number);

                const filterMachine = machine.data.filter((machine: any) => {
                    const dupMachine = setMachine.has(machine.reading_epc_hex);
                    setMachine.add(machine.reading_epc_hex);
                    return !dupMachine;
                });

                if(filterMachine != undefined){
                    if(filterMachine.length > 0){
                        filterMachine.forEach(async (item2: any) => {
                            const location: any = await Lines.findAll({
                                where:{
                                    ip_line: {
                                        [Op.iLike]: `%${item2.reading_reader_ip}%`
                                    }
                                }
                            });
        
                            const mother: any = await Mother.findAll({
                                where:{
                                    tag_code: {
                                        [Op.iLike]: `%${item2.reading_epc_hex}%`
                                    }
                                }
                            });

                            if(location.length > 0 && mother){
                                if(machines.length == 0){
                                    const now = moment().subtract(3, 'seconds').format("DD-MM-YYYY HH:mm:ss");
            
                                    // const hour = moment(item2.reading_created_at).subtract(1, 'hours').format("DD-MM-YYYY HH:mm:ss");

                                    const hour = moment(item2.reading_created_at).format("DD-MM-YYYY HH:mm:ss");
        
                                    if(hour >= now){
                                        machines.push({ motherpos: mother[0].number, location: location[0].number, position: item2.reading_antenna, time: item2.reading_created_at });
                                        await Api.create({ motherpos: mother[0].number, location: location[0].number, position: item2.reading_antenna, status: 'input' });
                                        io.emit('Status', { motherpos: mother[0].number, location: location[0].number.toLowerCase().replace(' ', ''), position: item2.reading_antenna, status: 'input' });
                                    }
        
                                }else{
                                    const now = moment().subtract(3, 'seconds').format("DD-MM-YYYY HH:mm:ss");
            
                                    // const hour = moment(item2.reading_created_at).subtract(1, 'hours').format("DD-MM-YYYY HH:mm:ss");

                                    const hour = moment(item2.reading_created_at).format("DD-MM-YYYY HH:mm:ss");
        
                                    if(hour >= now){
                                        let find = machines.findIndex((item3: any) => (item3 != null && (mother[0].number == item3.motherpos && location[0].number == item3.location && item3.position == item2.reading_antenna)));
                    
                                        if(find < 0){
                                            machines.push({ motherpos: mother[0].number, location: location[0].number, position: item2.reading_antenna, time: item2.reading_created_at });
                                            await Api.create({ motherpos: mother[0].number, location: location[0].number, position: item2.reading_antenna, status: 'input' });
                                            io.emit('Status', { motherpos: mother[0].number, location: location[0].number.toLowerCase().replace(' ', ''), position: item2.reading_antenna, status: 'input' });
                                        }else{
                                            machines[find].time = item2.reading_created_at
                                        }
                                    }
                                }
                            }else{
                                console.log('Ocorreu um erro!');
                            }
                        });
                    }   
                }
            //daqui pra baixo já tá ok
            }else{
                for(let i = 1; i <= 4; i++){
                    let machine = await verify(item.ip_terminal, i);

                    if(machine =! undefined){
                        if(machine.dados != undefined){
                            const location: any = await Lines.findAll({
                                where:{
                                    ip_line: {
                                        [Op.iLike]: `%${machine.dados[0].tag_reader_ip}%`
                                    }
                                }
                            });
        
                            const mother: any = await Mother.findAll({
                                where:{
                                    tag_code: {
                                        [Op.iLike]: `%${machine.dados[0].tag_epc}%`
                                    }
                                }
                            });
        
                            if(location.length > 0 && mother){
                                if(machines.length == 0){
                                    const now = moment().subtract(3, 'seconds').format("DD-MM-YYYY HH:mm:ss");
            
                                    const hour = moment(machine.dados[0].tag_read_date).subtract(1, 'hours').format("DD-MM-YYYY HH:mm:ss");
        
                                    if(hour >= now){
                                        machines.push({ motherpos: mother[0].number, location: location[0].number, position: machine.dados[0].tag_read_antenna, time: machine.dados[0].tag_read_date });
                                        await Api.create({ motherpos: mother[0].number, location: location[0].number, position: machine.dados[0].tag_read_antenna, status: 'input' });
                                        io.emit('Status', { motherpos: mother[0].number, location: location[0].number.toLowerCase().replace(' ', ''), position: machine.dados[0].tag_read_antenna, status: 'input' });
                                    }
        
                                }else{
                                    const now = moment().subtract(3, 'seconds').format("DD-MM-YYYY HH:mm:ss");
            
                                    const hour = moment(machine.dados[0].tag_read_date).subtract(1, 'hours').format("DD-MM-YYYY HH:mm:ss");
        
                                    if(hour >= now){
                                        let find = machines.findIndex((item2: any) => (item2 != null && (mother[0].number == item2.motherpos && location[0].number == item2.location && item2.position == machine.dados[0].tag_read_antenna)));
                    
                                        if(find < 0){
                                            machines.push({ motherpos: mother[0].number, location: location[0].number, position: machine.dados[0].tag_read_antenna, time: machine.dados[0].tag_read_date });
                                            await Api.create({ motherpos: mother[0].number, location: location[0].number, position: machine.dados[0].tag_read_antenna, status: 'input' });
                                            io.emit('Status', { motherpos: mother[0].number, location: location[0].number.toLowerCase().replace(' ', ''), position: machine.dados[0].tag_read_antenna, status: 'input' });
                                        }else{
                                            machines[find].time = machine.dados[0].tag_read_date
                                        }
                                    }
                                }
                            }else{
                                console.log('Ocorreu um erro!');
                            }
                        }
                    }
                }
            }
        });
    }

    if(machines.length > 0){
        machines.forEach(async (item: any, index: any) => {
            if(item != null){
                const now = moment().subtract(3, 'seconds').format("DD-MM-YYYY HH:mm:ss");
    
                // const hour = moment(item.time).subtract(1, 'hours').format("DD-MM-YYYY HH:mm:ss");

                const hour = moment(item.time).format("DD-MM-YYYY HH:mm:ss");
    
                if(hour < now){
                    await Api.create({ motherpos: item.motherpos, location: item.location, position: item.position, status: 'output' });
                    io.emit('Status', { motherpos: item.motherpos, location: item.location.toLowerCase().replace(' ', ''), position: item.position, status: 'output' });
                    machines[index] = null;
                }
            }
        });
    }
    
}, 1000);

//ROUTES

export const apiGet = async (req: Request, res: Response)=>{
    
    console.log('GET ROUTE');

    res.status(200).json({
        status: 200
    });
};

export const apiPost = async (req: Request, res: Response)=>{
    
    console.log('POST ROUTE');

    res.status(200).json({
        status: 200
    });
};

export const apiPut = async (req: Request, res: Response)=>{
    
    console.log('PUT ROUTE');

    res.status(200).json({
        status: 200
    });
};

export const apiDelete = async (req: Request, res: Response)=>{
    
    console.log('DELETE ROUTE');

    res.status(200).json({
        status: 200
    });
};

export default Reload;