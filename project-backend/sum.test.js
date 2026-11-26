const myfunction = require('./sum');
const fetchData = require('./function');
/*const sum = require("./sum");


test('add 3+4 to equal to 7', () => {
    expect(sum(3, 4)).toBe(7);
});*/

/*test('add 3+4 to equal to 7', () => {
    expect(3 + 4).toBe(7);
});*/

/*test('object assignment', () => {
    const data = { one: 1 };
    data['two'] = 2;
    expect(data).toEqual({ one: 1, two: 2 });
});*/

/*test('null is falsy', () => {
    const n = 0;
    expect(n).toBeFalsy();
});

test('1 is truthy', () => {
    const n = 1;
    expect(n).toBeTruthy();
});*/

/*test('throws on invalid input', () => {
    expect(() => {
        myfunction('lasdklf');
    }).toThrow();
})*/

test('the data is peanut butter', done => {
    function callback(data) {
        try {
            expect(data).toBe('peanut butter');
            done();
        }
        catch (error) {
            done(error);
        }

        fetchData(callback);

    }
});
