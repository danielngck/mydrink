const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    productType: { type: String, required: true }, // 'coffee' or 'snack'
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  status: { type: String, default: 'Processing' },
  orderDate: { type: Date, default: Date.now },  //remark: date is UTC
  referenceNumber: { type: Number, required: true, unique: true }, // Sequential reference
  userId: { type: mongoose.Schema.Types.ObjectId, required: true } // Link to user
}, { versionKey: false, collection: 'order' });

// Static method to get the next reference number
orderSchema.statics.getNextReferenceNumber = async function () {
  const latestOrder = await this.findOne().sort({ referenceNumber: -1 });
  let sequenceNumber = latestOrder ? latestOrder.referenceNumber + 1 : 1;

  if (sequenceNumber > 9999) {
    sequenceNumber = 1; // Reset to 1 after reaching 9999
  }

  return sequenceNumber; // Return as a number
};

module.exports = mongoose.model('Order', orderSchema);