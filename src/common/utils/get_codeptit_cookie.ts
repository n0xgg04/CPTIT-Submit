import axios from 'axios';
import config from '../config/config.js'
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';

dotenv.config();

export const getCodePtitCookie = async (username: string, password: string) => {
    const api = config.api.host
    const get_csrf = await axios.get(`${api}/login`,{
        headers:{
            'User-Agent' : 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36'
        }
    });
    const csrf_set_cookie = get_csrf.headers['set-cookie']?.[1];
    
    const $ = cheerio.load(get_csrf.data);
    const csrf = $('input[name="_token"]').val();
    let csrf_str: string = csrf as string;
    if (Array.isArray(csrf)) csrf_str = csrf[0];
    if(!csrf_str) throw new Error("Get csrf token failed!");
    const result = await axios.post(`${api}/login`,{
        username,
        password,
        _token: csrf_str.replace(' ','')
    },{
        headers:{
            Cookie: csrf_set_cookie,
        }
    });

    
    if(!result.headers['set-cookie']) throw new Error("Login failed!");
    const cookie = result.headers['set-cookie'][1];

    return {
        cookie, csrf_str
    }
};
