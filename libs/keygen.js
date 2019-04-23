module.exports = function(keyLength){
    let key = "", characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < keyLength; i++) {
        key += characters.substr(Math.floor((Math.random() * characters.length) + 1), 1);
    }
    return key;
};