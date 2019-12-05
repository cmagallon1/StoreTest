DROP FUNCTION IF EXISTS getTotal;
CREATE FUNCTION getTotal(purchaseId INT)
    RETURNS FLOAT
    BEGIN
        DECLARE total FLOAT;
        SELECT
            SUM(p.price) INTO total
        FROM
            products AS p
        INNER JOIN
            productsPurchases AS ps
        ON
            p.id = ps.idProduct
        WHERE
            ps.idPurchase = purchaseId;

        RETURN total;
    END;

DROP FUNCTION IF EXISTS getDiscountPerProduct;
CREATE FUNCTION getDiscountPerProduct( purchaseId INT, code VARCHAR(20))
    RETURNS FLOAT
    BEGIN
        DECLARE price FLOAT;
        DECLARE amount INT;

        SELECT
            count(ps.id),
            p.price
        INTO
            amount,
            price
        FROM
            products AS p
        INNER JOIN
            productsPurchases AS ps
        ON
            p.id = ps.idProduct
        WHERE
            ps.idPurchase = purchaseId
        AND
            p.code = code
        GROUP BY
            p.price;

        IF code = 'PANTS' THEN
            IF (amount / 2) > 0 THEN
                SET @total = (FLOOR(amount / 2) * price) + ((amount % 2 ) * price);
            ELSE
                SET @total = amount * price;
            END IF;
        ELSEIF code = 'TSHIRT' THEN
            IF amount >= 3 THEN
                SET @total = amount * 19;
            ELSE 
                SET @total = amount * price;
            END IF;
        ELSE 
            SET @total = amount * price;
        END IF;

        RETURN @total;
    END;