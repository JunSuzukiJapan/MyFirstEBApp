exports.Account = function(id, username, password, profile_id, created){
    this.id = id;
    this.username = username;
    this.password = password;
    this.profile_id = profile_id;
    this.created = created;
};

exports.Profile = function(profile_id, email, sex, description){
    this.profile_id = profile_id;
    this.email = email;
    this.sex = sex;
    this.description = description;
};