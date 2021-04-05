
const err = (res, errors) => res.status(404).json(errors);
module.exports = {
    err
}