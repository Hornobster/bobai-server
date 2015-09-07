drop function if exists upsert_token(INTEGER, VARCHAR(250));
drop function if exists upsert_registrationid(INTEGER, TEXT, CHAR(1));

CREATE FUNCTION upsert_token(uid INTEGER, t VARCHAR(250)) RETURNS VOID AS
$$
BEGIN
    LOOP
        -- first try to update the key
        UPDATE tokens SET token = t WHERE userid = uid;
        IF found THEN
            RETURN;
        END IF;
        -- not there, so try to insert the key
        -- if someone else inserts the same key concurrently,
        -- we could get a unique-key failure
        BEGIN
            INSERT INTO tokens(userid, token) VALUES (uid, t);
            RETURN;
        EXCEPTION WHEN unique_violation THEN
            -- do nothing, and loop to try the UPDATE again
        END;
    END LOOP;
END;
$$
LANGUAGE plpgsql;

CREATE FUNCTION upsert_registrationid(uid INTEGER, t TEXT, o CHAR(1)) RETURNS VOID AS
$$
BEGIN
    LOOP
        -- first try to update the key
        UPDATE gcm SET registrationid = t, os = o WHERE userid = uid;
        IF found THEN
            RETURN;
        END IF;
        -- not there, so try to insert the key
        -- if someone else inserts the same key concurrently,
        -- we could get a unique-key failure
        BEGIN
            INSERT INTO gcm(userid, registrationid, os) VALUES (uid, t, o);
            RETURN;
        EXCEPTION WHEN unique_violation THEN
            -- do nothing, and loop to try the UPDATE again
        END;
    END LOOP;
END;
$$
LANGUAGE plpgsql;
