var net = require('net');

function start_effect(effect, args, callback) {
    let socket = null;
    try {
        socket = net.connect('/tmp/litd');
        let command = {'type': 'command', 'effect': effect, 'args': args};
        socket.write(JSON.stringify(command));
    } catch(e){
        socket.end(e);
        return callback(undefined, conn_error(e));
    }

    socket.on('data', process_response(socket, callback));
}

function start_preset(preset, callback) {
    let socket = null;
    try {
        socket = net.connect('/tmp/litd');
        let command = {'type': 'command', 'preset': preset};
        socket.write(JSON.stringify(command));
    } catch(e){
        socket.end(e);
        return callback(undefined, conn_error(e));
    }

    socket.on('data', process_response(socket, callback));
}

function query(query, callback){
    let socket = null;
    try{
        socket = net.connect('/tmp/litd');
        msg = {'type': 'query', 'query': query};
        socket.write(JSON.stringify(msg));
    }catch (e) {
        socket.end(e);
        return callback(undefined, conn_error(e));
    }

    socket.on('data', process_response(socket, callback));
}

function dev_command(command, args, callback){
    let  socket = null;
    try{
        command = {'type': 'dev', 'command': command, 'args': args};
        socket = net.connect('/tmp/litd');
        socket.wite(JSON.stringify(command));
    } catch (e) {
        socket.end(e);
        return callback(undefined, conn_error(e))
    }

    socket.on('data', process_response(socket, callback ));
}

function process_response(socket, callback){
    socket.setEncoding('utf8');
    let complete_data = ''
    let msg_size = undefined
    let bytes_read = 0
    return function(data) {
        //First 32 bytes are a string representation of the message length. 
        //We don't need that part of the protocol, so thrown out data if it is a number.
        if(!msg_size) {
            let size_string = data.slice(0, 33);
            msg_size = parseInt(size_string)
            data = data.slice(33);
        }

        complete_data += data;
        bytes_read += data.length;

        if(bytes_read >= msg_size) {
            socket.end();
            callback(JSON.parse(complete_data));
        }
    }
}

function conn_error(e){
    return 'LIT Daemon error: ' + e;
}

function get_effects(callback){
    query('effects', res => callback(res['effects']));
}

function get_colors(callback){
    query('colors', res => callback(res['colors']));
}

function get_speeds(callback){
    query('speeds', res => callback(res['speeds']));
}

function get_sections(callback){
    query('sections', res => callback(res['sections']));
}

function get_zones(callback){
    query('zones', res => callback(res['zones']));
}

module.exports = { start_effect, start_preset, get_effects, get_colors, get_speeds, get_sections, get_zones };
