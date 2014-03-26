
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('drawit/index', { title: 'DrawIt!' });
};