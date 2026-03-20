let mongoose = require('mongoose');

let inventorySchema = mongoose.Schema(
    {
        product: {
            type: mongoose.Types.ObjectId,
            ref: 'product',
            required: true,
            unique: true
        },
        stock: {
            type: Number,
            default: 0,
            min: [0, 'Stock cannot be less than 0']
        },
        reserved: {
            type: Number,
            default: 0,
            min: [0, 'Reserved cannot be less than 0']
        },
        soldCount: {
            type: Number,
            default: 0,
            min: [0, 'SoldCount cannot be less than 0']
        }
    }, {
        timestamps: true
    }
);

module.exports = mongoose.model('inventory', inventorySchema);
