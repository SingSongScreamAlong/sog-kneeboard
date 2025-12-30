// =====================================================================
// PDF Report Generator
// Generate formatted PDF reports for race sessions
// =====================================================================

/**
 * PDF Report Generation using jsPDF
 * 
 * Note: This module provides the structure for PDF generation.
 * In production, install jsPDF: npm install jspdf jspdf-autotable
 */

export interface ReportData {
    sessionInfo: {
        name: string;
        trackName: string;
        date: Date;
        sessionType: string;
        laps: number;
        duration: string;
    };
    results: ResultEntry[];
    incidents: IncidentEntry[];
    penalties: PenaltyEntry[];
    recommendations: RecommendationEntry[];
    standings?: StandingsEntry[];
}

interface ResultEntry {
    position: number;
    carNumber: string;
    driverName: string;
    team?: string;
    laps: number;
    gap: string;
    points: number;
}

interface IncidentEntry {
    id: string;
    lap: number;
    type: string;
    drivers: string;
    severity: string;
    status: string;
    decision?: string;
}

interface PenaltyEntry {
    driver: string;
    carNumber: string;
    type: string;
    value: string;
    reason: string;
}

interface RecommendationEntry {
    lap: number;
    status: string;
    confidence: string;
    action: string;
    steward: string;
}

interface StandingsEntry {
    position: number;
    driver: string;
    points: number;
    wins: number;
    podiums: number;
}

/**
 * Generate a basic HTML report that can be printed to PDF
 * This approach works without external dependencies
 */
export function generateHTMLReport(data: ReportData): string {
    const { sessionInfo, results, incidents, penalties, recommendations } = data;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Race Report - ${sessionInfo.trackName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a1a; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #3b82f6; }
        .header h1 { font-size: 28px; color: #1e40af; margin-bottom: 5px; }
        .header .subtitle { font-size: 16px; color: #64748b; }
        .session-info { display: flex; justify-content: space-around; margin-bottom: 30px; padding: 15px; background: #f1f5f9; border-radius: 8px; }
        .session-info div { text-align: center; }
        .session-info .label { font-size: 12px; color: #64748b; text-transform: uppercase; }
        .session-info .value { font-size: 18px; font-weight: bold; color: #1e293b; }
        .section { margin-bottom: 30px; }
        .section h2 { font-size: 18px; color: #1e40af; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #e2e8f0; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #1e40af; color: white; padding: 10px 8px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
        .badge-green { background: #dcfce7; color: #166534; }
        .badge-yellow { background: #fef9c3; color: #854d0e; }
        .badge-red { background: #fee2e2; color: #991b1b; }
        .badge-blue { background: #dbeafe; color: #1e40af; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; }
        @media print { body { padding: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏁 Official Race Report</h1>
        <div class="subtitle">${sessionInfo.trackName} - ${sessionInfo.sessionType}</div>
    </div>

    <div class="session-info">
        <div>
            <div class="label">Date</div>
            <div class="value">${sessionInfo.date.toLocaleDateString()}</div>
        </div>
        <div>
            <div class="label">Laps</div>
            <div class="value">${sessionInfo.laps}</div>
        </div>
        <div>
            <div class="label">Duration</div>
            <div class="value">${sessionInfo.duration}</div>
        </div>
        <div>
            <div class="label">Incidents</div>
            <div class="value">${incidents.length}</div>
        </div>
        <div>
            <div class="label">Penalties</div>
            <div class="value">${penalties.length}</div>
        </div>
    </div>

    <div class="section">
        <h2>📊 Race Results</h2>
        <table>
            <thead>
                <tr>
                    <th>Pos</th>
                    <th>Car</th>
                    <th>Driver</th>
                    <th>Team</th>
                    <th>Laps</th>
                    <th>Gap</th>
                    <th>Points</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(r => `
                <tr>
                    <td><strong>${r.position}</strong></td>
                    <td>#${r.carNumber}</td>
                    <td>${r.driverName}</td>
                    <td>${r.team || '-'}</td>
                    <td>${r.laps}</td>
                    <td>${r.gap}</td>
                    <td>${r.points}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    ${incidents.length > 0 ? `
    <div class="section">
        <h2>⚠️ Incidents</h2>
        <table>
            <thead>
                <tr>
                    <th>Lap</th>
                    <th>Type</th>
                    <th>Drivers</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Decision</th>
                </tr>
            </thead>
            <tbody>
                ${incidents.map(i => `
                <tr>
                    <td>${i.lap}</td>
                    <td>${i.type.replace(/_/g, ' ')}</td>
                    <td>${i.drivers}</td>
                    <td><span class="badge badge-${i.severity === 'heavy' ? 'red' : i.severity === 'medium' ? 'yellow' : 'green'}">${i.severity}</span></td>
                    <td><span class="badge badge-blue">${i.status}</span></td>
                    <td>${i.decision || '-'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${penalties.length > 0 ? `
    <div class="section">
        <h2>🚩 Penalties</h2>
        <table>
            <thead>
                <tr>
                    <th>Driver</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Reason</th>
                </tr>
            </thead>
            <tbody>
                ${penalties.map(p => `
                <tr>
                    <td>#${p.carNumber} ${p.driver}</td>
                    <td>${p.type.replace(/_/g, ' ')}</td>
                    <td>${p.value}</td>
                    <td>${p.reason}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${recommendations.length > 0 ? `
    <div class="section">
        <h2>🎯 Steward Decisions</h2>
        <table>
            <thead>
                <tr>
                    <th>Lap</th>
                    <th>Recommended Status</th>
                    <th>Confidence</th>
                    <th>Action Taken</th>
                    <th>Steward</th>
                </tr>
            </thead>
            <tbody>
                ${recommendations.map(r => `
                <tr>
                    <td>${r.lap}</td>
                    <td>${r.status.replace(/_/g, ' ')}</td>
                    <td>${r.confidence}</td>
                    <td>${r.action}</td>
                    <td>${r.steward}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="footer">
        Generated by ControlBox Race Control System • ${new Date().toLocaleString()}
        <br>This is an internal report and does not represent official iRacing results.
    </div>
</body>
</html>
    `;
}

/**
 * Open print dialog for PDF generation
 */
export function printReport(data: ReportData): void {
    const html = generateHTMLReport(data);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
    }
}

/**
 * Download report as HTML file
 */
export function downloadHTMLReport(data: ReportData, filename: string): void {
    const html = generateHTMLReport(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Generate CSV export of results
 */
export function generateResultsCSV(results: ResultEntry[]): string {
    const headers = ['Position', 'Car Number', 'Driver', 'Team', 'Laps', 'Gap', 'Points'];
    const rows = results.map(r => [
        r.position,
        r.carNumber,
        r.driverName,
        r.team || '',
        r.laps,
        r.gap,
        r.points
    ]);

    return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
