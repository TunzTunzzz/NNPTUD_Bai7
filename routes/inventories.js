var express = require('express');
var router = express.Router();
let inventorySchema = require('../schemas/inventories')

// get all
router.get('/', async function (req, res, next) {
    try {
        let result = await inventorySchema.find({}).populate({ path: 'product' });
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// get inventory by ID ( có join với product)
router.get('/:id', async function (req, res, next) {
    try {
        let result = await inventorySchema.findById(req.params.id).populate({ path: 'product' });
        if (result) {
            res.status(200).send(result);
        } else {
            res.status(404).send({ message: "INVENTORY NOT FOUND" });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Add_stock ( {product, quantity} - POST tăng stock tương ứng với quantity
router.post('/add_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: "Invalid product or quantity" });
        }
        let result = await inventorySchema.findOneAndUpdate(
            { product: product },
            { $inc: { stock: quantity } },
            { new: true }
        );
        if (result) {
            res.status(200).send(result);
        } else {
            res.status(404).send({ message: "INVENTORY FOR PRODUCT NOT FOUND" });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Remove_stock ( {product, quantity} - POST giảm stock tương ứng với quantity
router.post('/remove_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: "Invalid product or quantity" });
        }
        let inventory = await inventorySchema.findOne({ product: product });
        if (!inventory) {
            return res.status(404).send({ message: "INVENTORY FOR PRODUCT NOT FOUND" });
        }
        if (inventory.stock < quantity) {
            return res.status(400).send({ message: "Not enough stock" });
        }
        inventory.stock -= quantity;
        await inventory.save();
        res.status(200).send(inventory);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// reservation : post ( {product, quantity} - POST giảm stock và tăng reserved tương ứng với quantity
router.post('/reservation', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: "Invalid product or quantity" });
        }
        let inventory = await inventorySchema.findOne({ product: product });
        if (!inventory) {
            return res.status(404).send({ message: "INVENTORY FOR PRODUCT NOT FOUND" });
        }
        if (inventory.stock < quantity) {
            return res.status(400).send({ message: "Not enough stock" });
        }
        inventory.stock -= quantity;
        inventory.reserved += quantity;
        await inventory.save();
        res.status(200).send(inventory);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// sold : post ( {product, quantity} - POST giảm reservation và tăng soldCount tương ứng với quantity
router.post('/sold', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: "Invalid product or quantity" });
        }
        let inventory = await inventorySchema.findOne({ product: product });
        if (!inventory) {
            return res.status(404).send({ message: "INVENTORY FOR PRODUCT NOT FOUND" });
        }
        if (inventory.reserved < quantity) {
            return res.status(400).send({ message: "Not enough reserved items" });
        }
        inventory.reserved -= quantity;
        inventory.soldCount += quantity;
        await inventory.save();
        res.status(200).send(inventory);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
