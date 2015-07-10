CREATE FUNCTION upsert_token(uid INTEGER, t VARCHAR(60)) RETURNS VOID AS
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
            INSERT INTO tokens(userid, token) VALUES (userid, t);
            RETURN;
        EXCEPTION WHEN unique_violation THEN
            -- do nothing, and loop to try the UPDATE again
        END;
    END LOOP;
END;
$$
LANGUAGE plpgsql;