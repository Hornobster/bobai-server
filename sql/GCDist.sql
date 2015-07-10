drop function if exists GCDist (FLOAT, FLOAT, FLOAT, FLOAT);
CREATE FUNCTION GCDist (
        _lat1 FLOAT,  -- Scaled Degrees north for one point
        _lon1 FLOAT,  -- Scaled Degrees west for one point
        _lat2 FLOAT,  -- other point
        _lon2 FLOAT
    ) RETURNS FLOAT
    IMMUTABLE AS
$$
    -- Hardcoded constant:
    DECLARE
        _deg2km FLOAT DEFAULT 0.0111325;
        _deg2rad FLOAT DEFAULT PI()/1800000;  -- For scaled by 1e4 to MEDIUMINT
        _rlat1 FLOAT DEFAULT _deg2rad * _lat1;
        _rlat2 FLOAT DEFAULT _deg2rad * _lat2;
    -- compute as if earth's radius = 1.0
        _rlond FLOAT DEFAULT _deg2rad * (_lon1 - _lon2);
        _m     FLOAT DEFAULT COS(_rlat2);
        _x     FLOAT DEFAULT COS(_rlat1) - _m * COS(_rlond);
        _y     FLOAT DEFAULT               _m * SIN(_rlond);
        _z     FLOAT DEFAULT SIN(_rlat1) - SIN(_rlat2);
        _n     FLOAT DEFAULT SQRT(_x * _x + _y * _y + _z * _z);
BEGIN
    RETURN _deg2km * 2 * ASIN(_n / 2) / _deg2rad;   -- again--scaled degrees
END;
$$
LANGUAGE plpgsql;
