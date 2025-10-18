DELIMITER $$
CREATE PROCEDURE `prc_consume_user_code` (
	p_code		VARCHAR(190)
)  
BEGIN

	DECLARE v_id_code BIGINT UNSIGNED DEFAULT NULL;
    DECLARE v_code_type VARCHAR(20) DEFAULT NULL;
    DECLARE v_id_user BIGINT UNSIGNED DEFAULT NULL;

    SELECT 
        id,
        user_id,
        type
    INTO 
        v_id_code,
        v_id_user,
        v_code_type
    FROM 
        user_code
    WHERE 
        code = p_code AND 
        is_active = TRUE AND 
        (expiry_date_time IS NULL OR expiry_date_time >= CURRENT_TIMESTAMP())
    ;

    IF v_id_code IS NULL THEN 
        CALL prc_throw_exception(NULL, 'InvalidUserCode');
    END IF;

    IF v_code_type = 'ACTIVATE' THEN 
        CALL prc_update_user(v_id_user, NULL, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE);
    END IF;

    CALL prc_update_user_code(v_id_code, NULL, NULL, NULL, NULL, FALSE, NULL);

    SELECT v_id_user AS idUser;

END$$