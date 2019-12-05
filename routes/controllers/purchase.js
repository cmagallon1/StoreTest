const Express = require('express');
const App = Express();
const Connection = require('../../db/index');
const util = require('util');

App.post('/', (req, res) => {
    const body = req.body;
    const { products } = body;
    createPurchase().then(purchase => {
        saveProducts(products, purchase.insertId).then(data => {
            getTotal(purchase.insertId).then(total => {
                savePurchase(total[0].total, purchase.insertId).then(response => {
                    return res.json({
                        ok: true,
                        data: {
                            items: products.join(', '),
                            total: `$${response}`
                        }
                    })
                }).catch(err => {
                    return res.status(500).json({
                        ok:false,
                        err: `Error finishing purchase: ${err}`
                    });    
                })
            }).catch(err => {
                return res.status(500).json({
                    ok:false,
                    err: `Error while calculating total: ${err}`
                });
            });
        }).catch(err => {
            return res.status(500).json({
                ok:false,
                err: `Error saving products: ${err}`
            });
        });
    }).catch(err => {
        return res.status(500).json({
            ok:false,
            err  
        })
    });
});

createPurchase = () => {
    let res = executeQuery("INSERT INTO purchases(subtotal, discount, total) VALUES(0, 0, 0)");
    return res;
}

getProductId = code => {
    let id = executeQuery(`SELECT id FROM products WHERE code = '${code}';`);
    return id;
}

saveProducts = async (products, purchaseId) => {
    let i = 0;
    while( i < products.length) {
        let res = await saveProduct(products[i], purchaseId)
        if(!res)
            return res;
        i++;
    }
}

saveProduct = async (product, purchaseId) => {
    let id = await getProductId(product);
    let query = `
        INSERT INTO 
            productsPurchases(idProduct, idPurchase) 
        VALUES
            (${id[0].id}, ${purchaseId})`;
    return executeQuery(query);
}

savePurchase = async (total, purchaseId) => {
    let totalDiscount = await getTotalDiscount(purchaseId);
    let discount = total - totalDiscount;
    let query = `
        UPDATE 
            purchases 
        SET 
            subTotal = ${total}, 
            discount = ${discount}, 
            total = ${totalDiscount} 
        WHERE 
            id = ${purchaseId}`;
    let res = await executeQuery(query);
    if(!res) 
        return res;
    return totalDiscount;
}

getTotalDiscount = async (purchaseId) => {
    let pants = await getDiscount(purchaseId, 'PANTS');
    let tshirt = await getDiscount(purchaseId, 'TSHIRT');
    let hat = await getDiscount(purchaseId, 'HAT');
    return pants[0].total + tshirt[0].total + hat[0].total;
}

getTotal = async (purchaseId) => {
    let res = await executeQuery(`SELECT getTotal(${purchaseId}) AS total`);
    return res;
}

getDiscount = async (purchaseId, code) => {
    let query = `SELECT getDiscountPerProduct(${purchaseId}, '${code}') AS total`;
    return executeQuery(query);
}

executeQuery = query => {
    Connection.query = util.promisify(Connection.query);
    return Connection.query(query);
}

module.exports = App;

