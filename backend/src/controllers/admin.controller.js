const something = async (req, res) => {
    try {
        res.status(200).json({message: 'something successful'});
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}


export { something };