USE ebdb;

/* Create Tables */
CREATE TABLE ACCOUNTS
(
    ID INT(12) UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT,
    USERNAME VARCHAR(255) NOT NULL UNIQUE,
    PASSWORD VARCHAR(200) NOT NULL,
    PROFILEID INT(12) UNSIGNED UNIQUE,
    CREATED DATETIME NOT NULL,

    PRIMARY KEY (ID)
) COMMENT = 'User Accounts';

CREATE TABLE PROFILES
(
    ID INT(12) UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT,
    EMAIL VARCHAR(255),
    SEX enum ('male', 'female', 'other') default 'other',
    DESCRIPTION TEXT,

    PRIMARY KEY (ID)
) COMMENT = 'Profiles';

/* Create Indexes */
CREATE UNIQUE INDEX USER_IDX ON ACCOUNTS (USERNAME ASC);
CREATE INDEX ACCOUNT_IDX ON ACCOUNTS (ID ASC);
CREATE UNIQUE INDEX PROFILE_IDX ON PROFILES (ID ASC);