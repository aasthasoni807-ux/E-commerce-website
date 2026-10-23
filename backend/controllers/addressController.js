import Address from '../models/Address.js';

export const saveAddress = async (req, res) => {
    try {
        const { fullName, phone, addressLine, city, state, pincode } = req.body;

        const address = await Address.create({
            userId: req.user.id,
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode,
        });

        res.status(201).json({ message: 'Address saved successfully', address });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
