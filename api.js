const express = require('express');

//create a get route with an id as parameter
router.get('/:id', (req, res) => {
    const { id } = req.params;
    // do something with the id
    res.json({id: id});
};
