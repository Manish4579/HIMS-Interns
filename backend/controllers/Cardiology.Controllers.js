// Cardiology.Controllers.js
import pool from "../db.js";

// ───────────────────────────────────────────────
// 1. UPSERT PATIENT (core demographics only)
// Columns: patient_id, patient_name, email, gender, blood_group, dob,
//          contact_number, address, age, height, weight,
//          emergency_name, emergency_contact_number
// ───────────────────────────────────────────────
export const upsertPatient = async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const {
            patient_name,
            email,
            gender,
            blood_group,
            dob,
            contact_number,
            address,
            age,
            height,
            weight,
            emergency_name,
            emergency_contact_number
        } = req.body;

        if (!patient_name || !contact_number) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: "patient_name and contact_number are required"
            });
        }

        let patientId = req.body.patient_id || req.params.patient_id;

        let result;
        if (patientId) {
            // Update existing
            result = await client.query(`
                UPDATE patients
                SET
                    patient_name              = COALESCE($1,  patient_name),
                    email                     = COALESCE($2,  email),
                    gender                    = COALESCE($3,  gender),
                    blood_group               = COALESCE($4,  blood_group),
                    dob                       = COALESCE($5,  dob),
                    contact_number            = COALESCE($6,  contact_number),
                    address                   = COALESCE($7,  address),
                    age                       = COALESCE($8,  age),
                    height                    = COALESCE($9,  height),
                    weight                    = COALESCE($10, weight),
                    emergency_name            = COALESCE($11, emergency_name),
                    emergency_contact_number  = COALESCE($12, emergency_contact_number)
                WHERE patient_id = $13
                RETURNING patient_id
            `, [
                patient_name, email, gender, blood_group, dob, contact_number,
                address, age, height, weight, emergency_name, emergency_contact_number,
                patientId
            ]);
        }

        if (!patientId || result.rowCount === 0) {
            // Insert new
            result = await client.query(`
                INSERT INTO patients (
                    patient_name, email, gender, blood_group, dob, contact_number,
                    address, age, height, weight, emergency_name, emergency_contact_number
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING patient_id
            `, [
                patient_name, email, gender, blood_group, dob, contact_number,
                address, age, height, weight, emergency_name, emergency_contact_number
            ]);
            patientId = result.rows[0].patient_id;
        }

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: patientId ? "Patient updated" : "Patient created",
            data: { patient_id: patientId }
        });
    } catch (error) {
        if (client) await client.query("ROLLBACK");
        console.error("Patient upsert error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

// ───────────────────────────────────────────────
// 2. VITAL SIGNS (BP, HR, RR, Temp, BMI)
// ───────────────────────────────────────────────
export const upsertVitalSigns = async (req, res) => {
    const { patient_id } = req.params;
    const { bp, hr, rr, temperature, bmi } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO vital_signs (patient_id, bp, hr, rr, temperature, bmi)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (patient_id) DO UPDATE SET
                bp          = EXCLUDED.bp,
                hr          = EXCLUDED.hr,
                rr          = EXCLUDED.rr,
                temperature = EXCLUDED.temperature,
                bmi         = EXCLUDED.bmi
            RETURNING *
        `, [patient_id, bp, hr, rr, temperature, bmi]);

        return res.status(200).json({
            success: true,
            message: "Vital signs saved",
            data: result.rows[0]
        });
    } catch (err) {
        console.error("Vital signs error:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ───────────────────────────────────────────────
// 3. MEDICAL HISTORY
// ───────────────────────────────────────────────
export const upsertMedicalHistory = async (req, res) => {
    const { patient_id } = req.params;
    const { allergies, past_medical_history, past_surgical_history, family_history, social_history } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO medical_history (
                patient_id, allergies, past_medical_history, past_surgical_history,
                family_history, social_history
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (patient_id) DO UPDATE SET
                allergies              = EXCLUDED.allergies,
                past_medical_history   = EXCLUDED.past_medical_history,
                past_surgical_history  = EXCLUDED.past_surgical_history,
                family_history         = EXCLUDED.family_history,
                social_history         = EXCLUDED.social_history
            RETURNING *
        `, [patient_id, allergies, past_medical_history, past_surgical_history, family_history, social_history]);

        return res.status(200).json({
            success: true,
            message: "Medical history saved",
            data: result.rows[0]
        });
    } catch (err) {
        console.error("Medical history error:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ───────────────────────────────────────────────
// 4. SYMPTOMS
// ───────────────────────────────────────────────
export const upsertSymptoms = async (req, res) => {
    const { patient_id } = req.params;
    const { chest_pain, dyspnea, orthopnea, pnd, palpitations, syncope, edema, fatigue, other_symptoms } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO symptoms (
                patient_id, chest_pain, dyspnea, orthopnea, pnd, palpitations,
                syncope, edema, fatigue, other_symptoms
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (patient_id) DO UPDATE SET
                chest_pain     = EXCLUDED.chest_pain,
                dyspnea        = EXCLUDED.dyspnea,
                orthopnea      = EXCLUDED.orthopnea,
                pnd            = EXCLUDED.pnd,
                palpitations   = EXCLUDED.palpitations,
                syncope        = EXCLUDED.syncope,
                edema          = EXCLUDED.edema,
                fatigue        = EXCLUDED.fatigue,
                other_symptoms = EXCLUDED.other_symptoms
            RETURNING *
        `, [patient_id, chest_pain, dyspnea, orthopnea, pnd, palpitations, syncope, edema, fatigue, other_symptoms]);

        return res.status(200).json({
            success: true,
            message: "Symptoms saved",
            data: result.rows[0]
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ───────────────────────────────────────────────
// 5. PRELIMINARY DIAGNOSIS
// ───────────────────────────────────────────────
export const upsertPreliminaryDiagnosis = async (req, res) => {
    const { patient_id } = req.params;
    const { suspected_condition, risk_level } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO preliminary_diagnosis (patient_id, suspected_condition, risk_level)
            VALUES ($1, $2, $3)
            ON CONFLICT (patient_id) DO UPDATE SET
                suspected_condition = EXCLUDED.suspected_condition,
                risk_level = EXCLUDED.risk_level
            RETURNING *
        `, [patient_id, suspected_condition, risk_level]);

        return res.status(200).json({
            success: true,
            message: "Preliminary diagnosis saved",
            data: result.rows[0]
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ───────────────────────────────────────────────
// 6. ORDERED INVESTIGATIONS (append-only + unique constraint)
// ───────────────────────────────────────────────
export const addOrderedInvestigation = async (req, res) => {
    const { patient_id } = req.params;
    const { test_type, test_name } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO ordered_investigations (patient_id, test_type, test_name)
            VALUES ($1, $2, $3)
            ON CONFLICT (patient_id, test_type, test_name) DO NOTHING
            RETURNING *
        `, [patient_id, test_type, test_name]);

        if (result.rowCount === 0) {
            return res.status(200).json({ success: true, message: "Test already ordered" });
        }

        return res.status(201).json({
            success: true,
            message: "Investigation added",
            data: result.rows[0]
        });
    } catch (err) {
        console.error("Add investigation error:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ───────────────────────────────────────────────
// 7. INVESTIGATION RESULTS
// ───────────────────────────────────────────────
export const upsertInvestigationResults = async (req, res) => {
    const { patient_id } = req.params;
    const { ecg_findings, echo_findings, lab_results, imaging_results, other_findings } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO investigation_results (
                patient_id, ecg_findings, echo_findings, lab_results, imaging_results, other_findings
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (patient_id) DO UPDATE SET
                ecg_findings    = EXCLUDED.ecg_findings,
                echo_findings   = EXCLUDED.echo_findings,
                lab_results     = EXCLUDED.lab_results,
                imaging_results = EXCLUDED.imaging_results,
                other_findings  = EXCLUDED.other_findings
            RETURNING *
        `, [patient_id, ecg_findings, echo_findings, lab_results, imaging_results, other_findings]);

        return res.status(200).json({
            success: true,
            message: "Investigation results saved",
            data: result.rows[0]
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ───────────────────────────────────────────────
// 8. FINAL DIAGNOSIS
// ───────────────────────────────────────────────
export const upsertFinalDiagnosis = async (req, res) => {
    const { patient_id } = req.params;
    const { primary_diagnosis, icd_code, severity, comorbidities } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO final_diagnosis (
                patient_id, primary_diagnosis, icd_code, severity, comorbidities
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (patient_id) DO UPDATE SET
                primary_diagnosis = EXCLUDED.primary_diagnosis,
                icd_code          = EXCLUDED.icd_code,
                severity          = EXCLUDED.severity,
                comorbidities     = EXCLUDED.comorbidities
            RETURNING *
        `, [patient_id, primary_diagnosis, icd_code, severity, comorbidities]);

        return res.status(200).json({
            success: true,
            message: "Final diagnosis saved",
            data: result.rows[0]
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ───────────────────────────────────────────────
// 9. MEDICATIONS (append-only)
// ───────────────────────────────────────────────
export const addMedication = async (req, res) => {
    const { patient_id } = req.params;
    const { name, dose, route, frequency, duration } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO medications (patient_id, name, dose, route, frequency, duration)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [patient_id, name, dose || null, route || null, frequency || null, duration || null]);

        return res.status(201).json({
            success: true,
            message: "Medication added",
            data: result.rows[0]
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ───────────────────────────────────────────────
// 10. PROCEDURES (append-only)
// ───────────────────────────────────────────────
export const addProcedure = async (req, res) => {
    const { patient_id } = req.params;
    const { name, indication, notes } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO procedures (patient_id, name, indication, notes)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [patient_id, name, indication || null, notes || null]);

        return res.status(201).json({
            success: true,
            message: "Procedure added",
            data: result.rows[0]
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ───────────────────────────────────────────────
// 11. MANAGEMENT NOTES (lifestyle + follow-up + warnings)
// ───────────────────────────────────────────────
export const upsertManagementNotes = async (req, res) => {
    const { patient_id } = req.params;
    const { lifestyle_advice, follow_up, warning_signs } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO management_notes (patient_id, lifestyle_advice, follow_up, warning_signs)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (patient_id) DO UPDATE SET
                lifestyle_advice = EXCLUDED.lifestyle_advice,
                follow_up        = EXCLUDED.follow_up,
                warning_signs    = EXCLUDED.warning_signs
            RETURNING *
        `, [patient_id, lifestyle_advice, follow_up, warning_signs]);

        return res.status(200).json({
            success: true,
            message: "Management notes saved",
            data: result.rows[0]
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ───────────────────────────────────────────────
// 12. PHYSICIAN NOTES
// ───────────────────────────────────────────────
export const upsertPhysicianNotes = async (req, res) => {
    const { patient_id } = req.params;
    const { physician_notes, patient_questions, action_items } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO physician_notes (patient_id, physician_notes, patient_questions, action_items)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (patient_id) DO UPDATE SET
                physician_notes    = EXCLUDED.physician_notes,
                patient_questions  = EXCLUDED.patient_questions,
                action_items       = EXCLUDED.action_items
            RETURNING *
        `, [patient_id, physician_notes, patient_questions, action_items]);

        return res.status(200).json({
            success: true,
            message: "Physician notes saved",
            data: result.rows[0]
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// ───────────────────────────────────────────────
// 13. SEARCH PATIENTS
// ───────────────────────────────────────────────
export const searchPatients = async (req, res) => {

    const { search } = req.query;

    try {

        const result = await pool.query(
            `
            SELECT p.patient_id, p.patient_name, v.measured_at
            FROM patients p
            JOIN vital_signs v ON v.patient_id = p.patient_id
            WHERE patient_name ILIKE $1
            ORDER BY patient_name
            LIMIT 20
            `,
            [`%${search || ""}%`]
        );

        res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error("Search patients error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
// ───────────────────────────────────────────────
// 14. GET CARDIOLOGY DETAILS
// ───────────────────────────────────────────────
export const getCardiologyDetails = async (req, res) => {
  const { patient_id } = req.params;

  try {
    // Patient Demographics
    const patient = await pool.query(
      "SELECT patient_id, patient_name, age, gender, contact_number FROM patients WHERE patient_id=$1",
      [patient_id]
    );

    // Vital Signs
    const vitalSigns = await pool.query(
      "SELECT * FROM vital_signs WHERE patient_id=$1",
      [patient_id]
    );

    // Medical History
    const medicalHistory = await pool.query(
      "SELECT * FROM medical_history WHERE patient_id=$1",
      [patient_id]
    );

    // Symptoms
    const symptoms = await pool.query(
      "SELECT * FROM symptoms WHERE patient_id=$1",
      [patient_id]
    );

    // Preliminary Diagnosis
    const preliminaryDiagnosis = await pool.query(
      "SELECT * FROM preliminary_diagnosis WHERE patient_id=$1",
      [patient_id]
    );
       const orderedInvestigations = await pool.query(
     "SELECT * FROM ordered_investigations WHERE patient_id=$1",
      [patient_id]
    );

    // Investigation Results
    const investigationResults = await pool.query(
      "SELECT * FROM investigation_results WHERE patient_id=$1",
      [patient_id]
    );

    // Final Diagnosis
    const finalDiagnosis = await pool.query(
      "SELECT * FROM final_diagnosis WHERE patient_id=$1",
      [patient_id]
    );

    // Medications
    const medications = await pool.query(
      "SELECT * FROM medications WHERE patient_id=$1",
      [patient_id]
    );

    // Procedures
    const procedures = await pool.query(
      "SELECT * FROM procedures WHERE patient_id=$1",
      [patient_id]
    );

    // Management Notes
    const managementNotes = await pool.query(
      "SELECT * FROM management_notes WHERE patient_id=$1",
      [patient_id]
    );

    // Physician Notes
    const physicianNotes = await pool.query(
      "SELECT * FROM physician_notes WHERE patient_id=$1",
      [patient_id]
    );

    res.json({
  success: true,
  data: {
    patient: patient.rows[0] || null,
    vitalSigns: vitalSigns.rows[0] || null,
    medicalHistory: medicalHistory.rows[0] || null,
    symptoms: symptoms.rows[0] || null,
    preliminaryDiagnosis: preliminaryDiagnosis.rows[0] || null,
    orderedInvestigations: orderedInvestigations.rows,   // 👈 HERE
    investigationResults: investigationResults.rows[0] || null,
    finalDiagnosis: finalDiagnosis.rows[0] || null,
    medications: medications.rows,
    procedures: procedures.rows,
    managementNotes: managementNotes.rows[0] || null,
    physicianNotes: physicianNotes.rows[0] || null
  }
});

  } catch (err) {
    console.error("Error fetching cardiology details:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cardiology data"
    });
  }
};