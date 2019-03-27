
export default (ctx) => {
  const User = ctx.models.User;

  let controller = {};

  controller.get = async function(req, res) {
    const userID = req.user.id;
    const user = await User.findOne({id: userID});

    return res.json(user);
  }

  return controller
}
