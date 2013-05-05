var mysql = require('mysql');
var account_model = require('./account');
var Account = account_model.Account;

// create connection to mysql
function createConnection(){
  return sqlConnection =  mysql.createConnection({
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    port     : process.env.RDS_PORT,
    database : 'ebdb'  // Elastic Beanstalk用RDSの詳細画面にある"DB Name:"の名前
  });
};

function createAccountWithTransaction(connection, username, password, email, sex, description, callback){
  var query = 'start transaction';
  connection.query(query, function(err, result){
    if(err){
      // start transactionに失敗。
      console.log('cannot start transaction.\n    ' + err);
      callback(err);
      return;
    }

    // 使われていないIDを計算。
    query = 'select max(ID) as solution from ACCOUNTS';
    connection.query(query, function(err, rows, fields){
      if(err){
        // max(ID)の取得に失敗。
        console.log('cannot select max(ID)');
        callback(err);
        return;
      }
      var id = rows[0].solution + 1;
      console.log('max id + 1 = ' + id);

      console.log('inserting profile...');
      query = "insert into PROFILES (ID, EMAIL, SEX, DESCRIPTION) values (?, ?, ?, ?)";
      connection.query(query, [id, email, sex, description], function(err, result){
        if(err){
          // プロフィールの登録に失敗。
          callback(err);
          return;  
        }
        console.log('profile inserted.');

        console.log('inserting account...');
        query = "insert into ACCOUNTS (ID, USERNAME, PASSWORD, PROFILEID, CREATED) values (?, ?, ?, ?, now())";
        connection.query(query, [ id, username, password, id], function(err, result){
          if(err){
            // アカウントの登録に失敗。ロールバックする。
            query = 'rollback';
            connection.query(query, function(e){
              if(e){
                // rollbackに失敗した旨をコールバックで伝達
                callback(e);
              }else{
                // アカウントの登録に失敗したことをコールバックで伝達
                callback(err);
              }
            });

          }else{
            // アカウントとプロフィールの登録に成功したのでcommit
            query = 'commit';
            connection.query(query, function(err){
              // commit自体が失敗した場合は
              // Account & Profileの登録が反映されないが
              // エラーが発生したことをコールバックで伝達。（エラーがない場合は,err=nullなので気にしない）
              console.log('query complete: add account');
              callback(err);
            });
          }
        });

      });
    });
  });
}

/*
 * method query
 *
 * @arg queryString -- query string
 * @arg callback -- callback function.
 *                         callback(err, rows, fields)
 */
function query(queryString, callback){
  // create connection to mysql
  var connection = createConnection();
  console.log('connection created.');

  // connection.connect は connection.queryが勝手にしてくれるからここでは呼ばない。
  // むしろ呼ぶと「２度接続した」とかいろいろエラーになる。

  // query
  console.log('calling connection.query: ' + queryString);
  connection.query(queryString, callback);
  console.log('called.');
};
exports.query = query;


/*
 * util methods
 */
function findById(id, callback) {
  var queryString = "SELECT * FROM ACCOUNTS WHERE ACCOUNTS.ID = '" + id + "'";

  query(queryString, function(err, rows, fields){
    if(err){
      callback(new Error('query error in findById.'));
      throw err;
    }

    if(rows.length > 0){
      var account = new Account(rows[0].ID, rows[0].USERNAME, rows[0].PASSWORD, rows[0].PROFILEID, rows[0].CREATED);
      callback(null, account);
    }else{
      callback(new Error('User ' + id + ' does not exist'));
    }
  });
}
exports.findById = findById;

function findByUsername(username, callback) {
  var queryString = "SELECT * FROM ACCOUNTS WHERE ACCOUNTS.USERNAME = '" + username + "'";
  console.log('findByUsername query:' + queryString);

  query(queryString, function(err, rows, fields){
    if(err){
      console.log('error: ' + err);
      callback(new Error('query error in findByUsername.'));
      throw err;
    }

    console.log('findByUsername querring. rows = ' + rows + ', fields = ' + fields);
    if(rows.length > 0){
      var account = new Account(rows[0].ID, rows[0].USERNAME, rows[0].PASSWORD, rows[0].PROFILEID, rows[0].CREATED);
      console.log('accout');
      console.log(account);
      //return callback(null, account);
      callback(null, account);
    }else{
      //return callback(null, null);
      callback(null, null);
    }
  });
}
exports.findByUsername = findByUsername;

function createAccount(username, password, email, sex, description, callback){
  console.log('username = ' + username + ', password = ' + password);

  // create connection to mysql
  var connection = createConnection();

  // connection.connect は connection.queryが勝手にしてくれるからここでは呼ばない。
  // むしろ呼ぶと「２度接続した」とかいろいろエラーになる。

  // query -- すでに使われているアカウント名かどうかチェックする。   
  var queryString = "SELECT * FROM ACCOUNTS WHERE ACCOUNTS.USERNAME = '" + username + "'";
  connection.query(queryString, function(err, rows, fields){
    if(err){
      console.log('query error in createAccount');
      callback(err);
      return;
    }

    createAccountWithTransaction(connection, username, password, email, sex, description, function(err){
      if(err){
        console.log('createAccountWithTransaction error');
        callback(err);
        return;
      }

      console.log('success: create account. user:' + username);
      callback(null); // success
    });

  });
}
exports.createAccount = createAccount;

/*
 * method signup
 */
exports.signup = function signup(req, res, callback){
  if(req.body.username && req.body.password){
    var username = req.body.username;
    //var password = des.crypt(req.body.password);
    var password = req.body.password;
    var email    = req.body.email;
    var sex      = req.body.sex || 'other';
    var description = req.body.description || '';

    createAccount(username, password, email, sex, description, function(err){
      if(err) throw err;
    });
    callback(null);
  }
};