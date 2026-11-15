-- =============================================================================
-- Atlas · Seed 01 · Scientific catalog (Group A, kept on demo reset)
-- 10 indicators · 3 incident scenarios · 13 library articles.
-- Every health statement comes from the team's analyses of the challenge sources:
--   Document 01  Challenge page "Create Health Monitoring Software…" (NASA Space Apps 2026)
--   Document 02  NASA HRP · 5 Hazards of Human Spaceflight
--   Document 03  NASA HRP · Risks of Human Spaceflight
--   Document 04  NASA HRP · Ongoing research (Standard Measures, ARCHeR, Tempus Pro…)
--   Document 05  CSA · Monitoring radiation (EVARM, Matroshka-R, Radi-N2, CANS)
--   Document 06  CSA · Why experiments in space
-- THRESHOLDS ARE DEMONSTRATION VALUES (RN-02): the sources document no clinical
-- thresholds for space. General Earth reference ranges come from Document 01 §5.3,
-- which itself labels them as general adult references, not space values.
-- =============================================================================

insert into public.indicator (
  code, name, system_code, unit, input_type, is_self_assessed, valid_min, valid_max,
  suggested_frequency, how_to_measure, why_it_matters, source, hazards,
  normal_min, normal_max, alert_min, alert_max, yellow_deviation_pct, red_deviation_pct,
  trend_readings, yellow_action, red_action, is_demo
) values
-- --- Cardiovascular ---------------------------------------------------------
(
  'heart_rate', 'Heart rate', 'cardiovascular', 'bpm', 'number', true, 20, 250, 'daily',
  $$Read your heart rate from the onboard vital-signs monitor and enter it in beats per minute.$$,
  $$Low gravity and other stressors can change the heart and blood vessels and may lead to arrhythmias (irregular heartbeat), and the risk grows on longer missions (Document 03). NASA names heart rate as an example of the measures it collects, and the Tempus Pro telemedicine device shows it on screen (Document 04).$$,
  $$Indicator proposed by the challenge (Document 01). Cardiovascular risk: Document 03 (Cardiovascular adaptations). Measured on Tempus Pro screen and named in Artemis II video: Document 04. General Earth reference (resting adults ~60–100 bpm): Document 01 §5.3 — not a space threshold.$$,
  $$[{"code":"gravity","name":"Gravity fields","explanation":"Low gravity can alter the heart and blood vessels, with arrhythmias among the possible effects.","source":"Document 03"},{"code":"isolation","name":"Isolation and confinement","explanation":"Stress is a shared factor of isolation and closed environments.","source":"Document 02"}]$$::jsonb,
  50, 100, 40, 130, 15, 30, 3,
  $$Repeat the reading to follow up (RN-08). It is included in your check-up report to the flight surgeon.$$,
  $$Repeat the reading and contact the flight surgeon; an urgent report is sent automatically (RN-08). Use Incident mode if you feel unwell.$$,
  true
),
(
  'systolic_pressure', 'Blood pressure (systolic)', 'cardiovascular', 'mmHg', 'number', true, 50, 260, 'daily',
  $$Use the onboard blood-pressure monitor as instructed by the device. Systolic is the first (higher) number, measured while the heart contracts.$$,
  $$Blood pressure is the force of blood against artery walls; systolic is measured while the heart contracts (Document 01). Spaceflight can lower blood pressure, which raises the chance of fainting on landing (Document 03).$$,
  $$Indicator proposed by the challenge (Document 01). Low blood pressure and fainting on landing: Document 03 (Cardiovascular adaptations). Shown on the Tempus Pro screen: Document 04. General Earth reference (below ~120/80 mmHg considered normal): Document 01 §5.3 — not a space threshold.$$,
  $$[{"code":"gravity","name":"Gravity fields","explanation":"Moving from weightlessness to gravity can cause light-headedness and fainting; low blood pressure makes fainting on landing more likely.","source":"Documents 02, 03"}]$$::jsonb,
  90, 130, 80, 160, 10, 20, 3,
  $$Repeat the reading to follow up (RN-08). It is included in your check-up report to the flight surgeon.$$,
  $$Repeat the reading and contact the flight surgeon; an urgent report is sent automatically (RN-08). Use Incident mode if you feel unwell.$$,
  true
),
(
  'diastolic_pressure', 'Blood pressure (diastolic)', 'cardiovascular', 'mmHg', 'number', true, 30, 160, 'daily',
  $$Taken in the same blood-pressure reading as the systolic value. Diastolic is the second (lower) number, measured while the heart relaxes.$$,
  $$Diastolic pressure is measured while the heart relaxes between beats (Document 01). Low gravity can alter the heart and blood vessels (Document 03).$$,
  $$Indicator proposed by the challenge (Document 01). Cardiovascular adaptations: Document 03. General Earth reference: Document 01 §5.3 — not a space threshold.$$,
  $$[{"code":"gravity","name":"Gravity fields","explanation":"Low gravity and other stressors can alter the heart and blood vessels.","source":"Document 03"}]$$::jsonb,
  60, 85, 50, 100, 10, 20, 3,
  $$Repeat the reading to follow up (RN-08). It is included in your check-up report to the flight surgeon.$$,
  $$Repeat the reading and contact the flight surgeon; an urgent report is sent automatically (RN-08). Use Incident mode if you feel unwell.$$,
  true
),
-- --- Immune & metabolic -----------------------------------------------------
(
  'temperature', 'Body temperature', 'immune_metabolic', '°C', 'number', true, 30, 44, 'daily',
  $$Use the onboard thermometer as instructed by the device and enter the value in °C.$$,
  $$Stressors such as radiation, microgravity and poor sleep can alter the immune system; some ISS astronauts have reported infections attributed to immune changes (Document 03). Temperature appears among the vital signs on the Tempus Pro screen (Document 04).$$,
  $$Indicator proposed by the challenge (Document 01). Altered immunity: Document 03. Shown on the Tempus Pro screen: Document 04. Link between temperature and immunity is an interpretation [INT] (Document 01 §9.1). General Earth reference (~36.1–37.2 °C): Document 01 §5.3 — not a space threshold.$$,
  $$[{"code":"hostile_environment","name":"Hostile closed environments","explanation":"Microbes transfer more easily between people in closed habitats, and stress can alter immunity.","source":"Document 02"}]$$::jsonb,
  36.0, 37.5, 35.0, 38.5, 2, 4, 3,
  $$Repeat the reading to follow up (RN-08). It is included in your check-up report to the flight surgeon.$$,
  $$Repeat the reading and contact the flight surgeon; an urgent report is sent automatically (RN-08). Use Incident mode if you feel unwell.$$,
  true
),
(
  'glucose', 'Blood glucose', 'immune_metabolic', 'mg/dL', 'number', true, 20, 600, 'daily',
  $$If a glucose meter is available, follow its instructions and enter the value in mg/dL.$$,
  $$The Canadian Space Agency notes that insulin resistance, associated with type 2 diabetes, can develop in space (Document 06).$$,
  $$Indicator proposed by the challenge (Document 01). Insulin resistance / type 2 diabetes risk: Document 06. Transparency: the analysed sources do not document routine glucose measurement during flight. General Earth reference (fasting ~70–99 mg/dL): Document 01 §5.3 — not a space threshold.$$,
  $$[{"code":"gravity","name":"Gravity fields","explanation":"Stiffer vessels and insulin resistance are linked to type 2 diabetes and cardiovascular risk.","source":"Document 06"}]$$::jsonb,
  70, 140, 54, 250, 15, 30, 3,
  $$Repeat the reading to follow up (RN-08). It is included in your check-up report to the flight surgeon.$$,
  $$Repeat the reading and contact the flight surgeon; an urgent report is sent automatically (RN-08). Use Incident mode if you feel unwell.$$,
  true
),
-- --- Behavioral & sleep -----------------------------------------------------
(
  'sleep_hours', 'Sleep duration', 'behavioral_sleep', 'hours', 'number', true, 0, 24, 'daily',
  $$Enter how many hours you slept in the last 24 hours (from your sleep log or wrist sensor).$$,
  $$Workload, irregular light–dark cycles and disrupted sleep patterns can harm health and the mission; ISS astronauts see 16 sunrises and sunsets a day (Document 03). NASA studies collect sleep reports and wrist actigraphy before, during and after missions (Document 04).$$,
  $$Indicator proposed by the challenge (Document 01). Inadequate sleep risk: Document 03. Sleep reports and actigraphy: Document 04. General Earth reference (adults 7–9 h recommended): Document 01 §5.3 — not a space threshold.$$,
  $$[{"code":"isolation","name":"Isolation and confinement","explanation":"Isolation plus sleep loss, circadian desynchronization and workload reduce performance.","source":"Document 02"}]$$::jsonb,
  6, 9, 4, 12, 20, 40, 3,
  $$Follow up on your sleep in the next check-ups. NASA describes designated relaxation time as a countermeasure (Document 03).$$,
  $$Report it to the flight surgeon and review your work schedule.$$,
  true
),
(
  'mood', 'Mood', 'behavioral_sleep', 'scale 1–5', 'scale', true, 1, 5, 'daily',
  $$Rate how you feel today from 1 (very low) to 5 (very good). There is no right answer.$$,
  $$Long isolation and confinement can raise the risk of behavioral problems such as anxiety and depression, affecting sleep, morale and decisions (Document 03). Mood is usually measured by self-report, not by an instrument (Document 01).$$,
  $$Indicator proposed by the challenge (Document 01). Behavioral changes risk: Document 03. Self-report nature of mood: Document 01 §5.3. The 1–5 scale is a demonstration choice; the sources give no numeric mood value.$$,
  $$[{"code":"isolation","name":"Isolation and confinement","explanation":"Prolonged isolation can increase anxiety and depression and affect sleep and morale.","source":"Documents 02, 03"},{"code":"distance","name":"Distance from Earth","explanation":"Long communication delays create new challenges for talking with family and medical staff.","source":"Document 03"}]$$::jsonb,
  3, 5, 2, null, 25, 50, 3,
  $$Consider a self-care activity such as keeping a journal, and mention it in your report.$$,
  $$Talk to the flight surgeon; you can send a private message from Communications.$$,
  true
),
-- --- Simulated (not in the daily form, RN-03) --------------------------------
(
  'bone_density', 'Bone density change', 'bone_muscle', '% change/month', 'number', false, -10, 5, 'monthly',
  $$Not self-measured. Comes from periodic bone scans (simulated data in this prototype).$$,
  $$In microgravity, weight-bearing bones lose on average 1–1.5% of density per month during 4–6 month missions, which can lead to fractures and early osteoporosis (Documents 02, 03). The CSA cites up to 1.5% per month (Document 06).$$,
  $$Bone loss figures: Documents 02 and 03 (average 1–1.5%/month), Document 06 (up to 1.5%/month). Bone scans before and after flight: Document 03. Values in Atlas are simulated.$$,
  $$[{"code":"gravity","name":"Gravity fields","explanation":"Without continuous load, weight-bearing bones lose mineral density.","source":"Documents 02, 03"}]$$::jsonb,
  -1.0, 1.0, -2.0, null, null, null, 3,
  $$Loss is within the documented average range; keep resistance exercise as scheduled.$$,
  $$Loss is beyond the documented average; the flight surgeon should review the scan.$$,
  true
),
(
  'eye_exam', 'Eye exam (SANS)', 'neuro_ocular', 'OCT index (demo)', 'number', false, 0, 100, 'monthly',
  $$Not self-measured. Comes from periodic eye imaging (optical coherence tomography and fundoscope). The index is simulated.$$,
  $$Chronic weightlessness shifts fluids toward the head and can cause optic-nerve swelling, retinal folds and flattening of the back of the eye (SANS); about 70% of ISS astronauts have some swelling at the back of the eye (Document 03).$$,
  $$SANS: Document 03. On the ISS, optical coherence tomography (OCT) and a fundoscope are used to image the eye (Documents 03 and 04). The sources document no numeric measure or unit; the OCT index is a demonstration value.$$,
  $$[{"code":"gravity","name":"Gravity fields","explanation":"Fluid shifts toward the head put pressure on the eyes.","source":"Documents 02, 03"},{"code":"radiation","name":"Space radiation","explanation":"Radiation is linked to degenerative effects that include the eyes.","source":"Document 03"}]$$::jsonb,
  0, 30, null, 60, null, null, 3,
  $$Change detected; the next scheduled eye exam should be compared with this one.$$,
  $$Marked change; the flight surgeon should review the images.$$,
  true
),
(
  'radiation_dose', 'Radiation dose', 'environment_radiation', 'µSv/day', 'number', false, 0, 10000, 'continuous_telemetry',
  $$Not self-measured. Cabin dosimeters measure continuously (simulated telemetry in this prototype, one daily total).$$,
  $$Radiation cannot be seen or felt (Document 02). Neutrons make up about 30% of total radiation on the ISS, with a typical neutron dose of 150 µSv per day (Document 05). Solar storms can bring potentially lethal doses (Document 05).$$,
  $$Radiation hazard: Document 02. Neutron share and 150 µSv/day typical neutron dose on the ISS: Document 05 (Radi-N2). Solar storms: Documents 02, 05. Values in Atlas are simulated; the normal band is a demonstration choice that includes the documented typical neutron dose.$$,
  $$[{"code":"radiation","name":"Space radiation","explanation":"Galactic cosmic rays and solar storms raise cancer risk and can affect the central nervous system.","source":"Documents 02, 03"}]$$::jsonb,
  0, 300, null, 1000, null, null, 3,
  $$Dose is above the usual band; follow up on the next readings and report it to ground.$$,
  $$Possible solar storm. Follow the Solar storm incident steps and move to the most shielded area.$$,
  true
);

-- -----------------------------------------------------------------------------
-- Incident scenarios (RN-13: only verification, data entry, escalation or
-- actions documented in the sources — never drugs or treatments)
-- -----------------------------------------------------------------------------
insert into public.incident_scenario (code, name, description, source, steps) values
(
  'fainting_gravity',
  'Light-headedness or fainting (gravity transition)',
  $$Moving from weightlessness to gravity can cause light-headedness and fainting, and spaceflight can lower blood pressure, which makes fainting on landing more likely.$$,
  $$Documents 02 (gravity transitions) and 03 (cardiovascular adaptations).$$,
  $$[
    {"order":1,"instruction":"Stop the current task and make sure the crew member is in a safe position.","type":"verification","indicator_code":null},
    {"order":2,"instruction":"Check whether they respond to your voice and note the time.","type":"verification","indicator_code":null},
    {"order":3,"instruction":"Record heart rate.","type":"data_entry","indicator_code":"heart_rate"},
    {"order":4,"instruction":"Record blood pressure (systolic).","type":"data_entry","indicator_code":"systolic_pressure"},
    {"order":5,"instruction":"Record blood pressure (diastolic).","type":"data_entry","indicator_code":"diastolic_pressure"},
    {"order":6,"instruction":"Send the urgent report to the flight surgeon and follow their instructions.","type":"escalation","indicator_code":null}
  ]$$::jsonb
),
(
  'chest_pain',
  'Chest pain or collapse',
  $$The challenge video describes a chest-pain-and-collapse emergency halfway to Mars. Low gravity and other stressors can lead to arrhythmias and cardiovascular disease.$$,
  $$Documents 01 (challenge video scenario) and 03 (cardiovascular adaptations).$$,
  $$[
    {"order":1,"instruction":"Stop all activity. Note the time the symptoms started.","type":"verification","indicator_code":null},
    {"order":2,"instruction":"Check whether the crew member is responsive and breathing normally.","type":"verification","indicator_code":null},
    {"order":3,"instruction":"Record heart rate.","type":"data_entry","indicator_code":"heart_rate"},
    {"order":4,"instruction":"Record blood pressure (systolic).","type":"data_entry","indicator_code":"systolic_pressure"},
    {"order":5,"instruction":"Record blood pressure (diastolic).","type":"data_entry","indicator_code":"diastolic_pressure"},
    {"order":6,"instruction":"Send the urgent report to the flight surgeon now and stay with the crew member until they reply.","type":"escalation","indicator_code":null}
  ]$$::jsonb
),
(
  'solar_storm',
  'Solar storm alert (shelter and dosimetry)',
  $$Solar storms can bring potentially lethal radiation doses; the crew can take shelter in the parts of the station with more protection.$$,
  $$Documents 02 (solar storms as radiation source) and 05 (Radi-N2 video: sheltering in more protected areas).$$,
  $$[
    {"order":1,"instruction":"Move to the most shielded area of the vehicle (the shelter).","type":"documented_action","indicator_code":null},
    {"order":2,"instruction":"Confirm that every crew member is in the shelter.","type":"verification","indicator_code":null},
    {"order":3,"instruction":"Record the current dosimeter reading.","type":"data_entry","indicator_code":"radiation_dose"},
    {"order":4,"instruction":"Notify the flight surgeon and ground control.","type":"escalation","indicator_code":null},
    {"order":5,"instruction":"Stay in the shelter until ground confirms it is safe to leave.","type":"verification","indicator_code":null}
  ]$$::jsonb
);

-- -----------------------------------------------------------------------------
-- Library articles (verified knowledge, every one cites its source)
-- -----------------------------------------------------------------------------
insert into public.library_article (category, title, summary, content, source, indicator_id) values
(
  'hazard', 'The five hazards of human spaceflight',
  $$NASA's Human Research Program groups spaceflight challenges into five hazards: space radiation, isolation and confinement, distance from Earth, gravity fields, and hostile closed environments.$$,
  $$## The five hazards

1. **Space radiation**: galactic cosmic rays and solar storms; ionizing, invisible and impossible to feel.
2. **Isolation and confinement**: months in a small space with a small group; linked to sleep loss, circadian desynchronization and workload.
3. **Distance from Earth**: up to 20 minutes of one-way communication delay on a Mars mission, so crews must handle situations with minimal support.
4. **Gravity fields**: weightlessness, partial gravity and transitions between them affect bone, muscle, vision, balance and circulation.
5. **Hostile closed environments**: microbes change and transfer more easily between people; stress can alter immunity.

The hazards add to each other; they are not independent.$$,
  $$Document 02 (NASA HRP · 5 Hazards of Human Spaceflight); hazard list also in Document 01.$$,
  null
),
(
  'technology', 'Neutron dosimetry on the ISS (Radi-N2 and CANS)',
  $$Canadian instruments measure the radiation astronauts receive, from bubble detectors in Radi-N2 to the continuous, autonomous neutron spectrometer CANS.$$,
  $$## Measuring an invisible hazard

- **Bubble detectors (Radi-N2, 2012–2020):** a gel whose droplets turn into visible bubbles when hit by neutrons; a reader counts them and scientists on the ground compute the dose. Six monitors were placed for seven days, one worn by an astronaut.
- **Neutrons** are about **30%** of total radiation on the ISS; a typical neutron dose is **150 µSv per day**.
- **CANS** (Canadian neutron spectrometer, in development) measures neutrons continuously and autonomously.
- Doses are lower in sleeping quarters, and during a solar storm the crew can shelter in more protected areas.$$,
  $$Document 05 (CSA · Monitoring radiation: Radi-N2, CANS).$$,
  (select id from public.indicator where code = 'radiation_dose')
),
(
  'technology', 'Tempus Pro: telemedicine for deep space',
  $$NASA is testing a commercial telemedicine device that collects and integrates vital health data and medical images, so crews far from Earth can be assessed with less real-time support.$$,
  $$## Why a compact medical device

As crews move away from Earth, communication delays matter more. NASA's Tempus Pro study evaluates whether a light, compact device can **collect and integrate vital health data**, provide **medical images**, and support near-real-time diagnosis.

During participating missions, the crew medical officer works through a **simulated medical scenario** using the device. The device's photo shows vital signs such as heart rate, blood pressure and temperature on screen.$$,
  $$Document 04 (NASA HRP ongoing research · Tempus Pro).$$,
  null
),
(
  'indicator', 'Heart rate in space',
  $$Low gravity can alter the heart and blood vessels; arrhythmias are among the documented cardiovascular risks.$$,
  $$Low gravity and other stressors can change the heart and blood vessels and may lead to **arrhythmias**, blood clots and cardiovascular disease; the risk grows with mission length. The heart can even become more spherical.

NASA cites heart rate as an example of the measures collected from astronauts, and the Tempus Pro device displays it.

*Atlas thresholds are demonstration values; the sources give no clinical heart-rate limits for space.*$$,
  $$Documents 03 (cardiovascular adaptations) and 04 (Artemis II video, Tempus Pro).$$,
  (select id from public.indicator where code = 'heart_rate')
),
(
  'indicator', 'Blood pressure and fainting',
  $$Spaceflight can lower blood pressure, which makes fainting on landing more likely.$$,
  $$Blood pressure has two numbers: **systolic** (heart contracting) and **diastolic** (heart relaxing). In space, cardiovascular adaptations can lead to **low blood pressure**, which increases the chance of fainting when returning to gravity.

Documented countermeasures include regular exercise, lower-body compression garments and drinking plenty of fluids before landing.

*Atlas thresholds are demonstration values.*$$,
  $$Documents 01 (definition) and 03 (cardiovascular adaptations).$$,
  (select id from public.indicator where code = 'systolic_pressure')
),
(
  'indicator', 'Body temperature and immunity',
  $$Stressors such as radiation, microgravity and poor sleep can alter immunity; some ISS astronauts have reported infections.$$,
  $$Spaceflight stressors can alter the immune system, wake up latent viruses and cause atypical allergies or infections. NASA monitors blood, saliva and urine and now seeks in-flight samples.

Atlas tracks body temperature as a simple daily signal; linking it to immunity is an interpretation, not a claim of the sources.

*Atlas thresholds are demonstration values.*$$,
  $$Documents 03 (altered immunity) and 04 (Tempus Pro screen, Immune Biomarkers); interpretation per Document 01.$$,
  (select id from public.indicator where code = 'temperature')
),
(
  'indicator', 'Blood glucose: why it is on the list',
  $$Glucose is proposed by the challenge; the CSA notes insulin resistance can develop in space, but the sources do not document routine in-flight glucose measurement.$$,
  $$The challenge lists blood sugar among the indicators to track. The Canadian Space Agency explains that in space **insulin resistance**, associated with **type 2 diabetes**, can develop, together with stiffer blood vessels.

**Transparency:** none of the analysed sources documents that glucose is measured routinely during flight. Atlas includes it because the challenge proposes it.

*Atlas thresholds are demonstration values.*$$,
  $$Documents 01 (challenge indicator) and 06 (CSA · insulin resistance).$$,
  (select id from public.indicator where code = 'glucose')
),
(
  'indicator', 'Sleep in orbit',
  $$ISS astronauts see 16 sunrises and sunsets a day; workload and irregular light can disrupt sleep.$$,
  $$Inadequate sleep and irregular schedules are a recognised NASA risk: workload, irregular light–dark cycles and disrupted sleep patterns have short- and long-term health consequences.

Countermeasures described by NASA include LED lighting that simulates Earth's light cycle and designated relaxation time. Studies collect **sleep reports** and **wrist actigraphy** before, during and after missions.

*Atlas thresholds are demonstration values.*$$,
  $$Documents 03 (sleep risk) and 04 (Standard Measures, ARCHeR).$$,
  (select id from public.indicator where code = 'sleep_hours')
),
(
  'indicator', 'Mood, isolation and self-care',
  $$Long isolation can raise anxiety and depression, affecting sleep, morale and decisions. NASA encourages self-care such as keeping a journal.$$,
  $$Prolonged isolation and confinement can increase the risk of behavioral problems and psychiatric disorders such as **anxiety and depression**, affecting sleep, morale and decision-making. Long communication delays on a Mars mission add new challenges.

NASA encourages self-care options like **journaling**; growing fresh vegetables may have therapeutic benefits; windows reduce monotony.

Mood is measured by self-report. The 1–5 scale in Atlas is a demonstration choice.$$,
  $$Documents 01 (self-report), 02 (isolation hazard) and 03 (behavioral changes).$$,
  (select id from public.indicator where code = 'mood')
),
(
  'indicator', 'Bone loss in microgravity',
  $$Weight-bearing bones lose on average 1–1.5% of density per month during 4–6 month missions.$$,
  $$Without continuous load, the spine and hips lose mineral density: **on average 1–1.5% per month** during four- to six-month missions (the CSA cites up to 1.5% per month). This can lead to fractures and premature osteoporosis, and more calcium is excreted, raising kidney-stone risk.

NASA uses resistance exercise and routine bone scans before and after flight; whether the rate persists on longer missions is still being researched.

*Bone values in Atlas are simulated.*$$,
  $$Documents 02, 03 (NASA bone loss) and 06 (CSA up to 1.5%/month).$$,
  (select id from public.indicator where code = 'bone_density')
),
(
  'risk', 'SANS: spaceflight-associated neuro-ocular syndrome',
  $$About 70% of ISS astronauts have some swelling at the back of the eye; the long-term outcome is unknown.$$,
  $$Chronic weightlessness shifts blood and cerebrospinal fluid toward the head. This can cause **optic-nerve swelling, retinal folds, flattening of the back of the eye and brain swelling**: together called SANS. Some astronauts have mild changes, others clinically significant ones.

Eyes are imaged in orbit with a **fundoscope** and **optical coherence tomography (OCT)**. SANS is a top research priority before a Mars mission.

*The OCT index in Atlas is a demonstration value; the sources give no numeric unit.*$$,
  $$Documents 03 (SANS) and 04 (eye imaging studies).$$,
  (select id from public.indicator where code = 'eye_exam')
),
(
  'risk', 'Radiation and cancer risk',
  $$Astronauts receive more radiation in space than on Earth; missions beyond the magnetosphere lose most of its protection.$$,
  $$Space radiation can lead to certain cancers and may raise the risk of degenerative disorders of the heart, blood vessels and eyes, and affect the central nervous system.

Earth's magnetosphere acts as a protective bubble; ISS missions stay inside it, while Moon and Mars missions leave it. NASA uses health surveillance, onboard radiation instruments and shielding.

*Radiation values in Atlas are simulated.*$$,
  $$Documents 02 (radiation hazard) and 03 (radiation carcinogenesis).$$,
  (select id from public.indicator where code = 'radiation_dose')
),
(
  'system', 'Communication delay with Earth',
  $$On a Mars mission, a message can take up to 20 minutes each way, so crews need more medical autonomy.$$,
  $$Distance from Earth means delayed communication: **up to 20 minutes one way** on a Mars mission (analogs such as HERA simulate up to 5 minutes). Medical support, resupply and emergency return become harder, which is why self-assessment and clear escalation matter.

Atlas simulates this delay for every ship–ground message.$$,
  $$Document 02 (distance hazard, communication delay); medical-autonomy reading per Document 01.$$,
  null
);
