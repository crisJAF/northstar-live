from pathlib import Path
import json, html
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4

root=Path(__file__).resolve().parents[1]
data=json.loads((root/'tmp/pdfs/answer-guide.json').read_text(encoding='utf-8'))
out=root/'output/pdf/northstar-live-guia-de-puzzles.pdf';out.parent.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold', 'C:/Windows/Fonts/arialbd.ttf'))
ink=colors.HexColor('#211A38');purple=colors.HexColor('#6B4B82');green=colors.HexColor('#215E44')
styles={
 'title':ParagraphStyle('title',fontName='ArialBold',fontSize=28,leading=33,textColor=ink,spaceAfter=20),
 'h':ParagraphStyle('h',fontName='ArialBold',fontSize=19,leading=24,textColor=ink,spaceAfter=14),
 'label':ParagraphStyle('label',fontName='ArialBold',fontSize=9,leading=12,textColor=purple,spaceAfter=12),
 'body':ParagraphStyle('body',fontName='Arial',fontSize=10,leading=15,textColor=ink,spaceAfter=9),
 'small':ParagraphStyle('small',fontName='Arial',fontSize=9,leading=13,textColor=ink,spaceAfter=6),
 'answer':ParagraphStyle('answer',fontName='ArialBold',fontSize=10,leading=15,textColor=green,spaceAfter=0),
}
def clean(s):return html.escape(s.replace('—','-').replace('–','-').replace('…','...'))
def para(s,style='body'):return Paragraph(clean(s),styles[style])
def footer(c,d):
 c.setStrokeColor(colors.HexColor('#D6CDE0'));c.line(42,43,A4[0]-42,43)
 c.setFont('Arial',8);c.setFillColor(purple);c.drawString(42,30,'NORTHSTAR LIVE  |  GUÍA PRIVADA DEL PRESENTADOR');c.drawRightString(A4[0]-42,30,str(d.page))
doc=SimpleDocTemplate(str(out),pagesize=A4,rightMargin=44,leftMargin=44,topMargin=48,bottomMargin=58,title='Northstar Live - Guía de puzzles y respuestas',author='Northstar Live')
flow=[para('OPERACIÓN NOCHEBUENA / EDICIÓN INDIVIDUAL','label'),Spacer(1,25),para('Puzzles y respuestas\npara salvar la Navidad'.replace('\n',' '),'title'),para('Guía privada del presentador. Contiene las soluciones reales de los siete puzzles de opción múltiple y el protocolo del reto de carga individual.'),Spacer(1,20),para('Reglas de puntuación','h')]
for rule in ['Cada puzzle o carga completada vale 100 puntos, una sola vez por jugador.','El cupo es la mitad de los inscritos al iniciar, redondeada hacia arriba. Con 14 participantes ganan exactamente los primeros 7 que completen cada reto.','Las respuestas incorrectas no suman. Hay una espera de cuatro segundos antes de reintentar.','Al alcanzar el cupo, las respuestas se cierran. Cinco segundos después el servidor avanza automáticamente.','Si alguien se desconecta, el cupo no baja. El presentador puede cerrar con ayuda: conserva los puntos ganados y no concede puntos adicionales.','El ranking ordena por puntos; en empate, menor tiempo acumulado de aciertos y luego orden de ingreso. El último adorno es el Grinch.','Los votos de opinión, la cláusula libre y el encendido final no suman puntos: no tienen una respuesta correcta.']:
 flow.append(para('- '+rule))
flow.extend([Spacer(1,14),para('Cómo leer la guía','h'),para('Cada página reproduce las pistas y las alternativas del catálogo. La respuesta verdadera aparece resaltada en verde y rotulada CORRECTA. La página de carga describe una acción, no una pregunta que aparezca en pantalla.'),para('Aventura completa: hasta 800 puntos por persona. Misión corta: hasta 300. La duración depende de la velocidad de los participantes.'),PageBreak()])
for number,q in enumerate(data['questions'],1):
 flow.extend([para(f"RETO {number:02d} / {q['tag']}",'label'),para(q['title'],'h'),para(q['prompt']),para('Pistas y condiciones','label')])
 for clue in q['clues']:flow.append(para('- '+clue,'small'))
 flow.extend([Spacer(1,8),para('Alternativas y solución','label')])
 for opt in q['choices']:
  good=opt['id']==q['correct'];label=f"{opt['id']}. {'CORRECTA - ' if good else ''}{opt['label']}"
  box=Table([[para(label,'answer' if good else 'body')]],colWidths=[A4[0]-88]);box.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#E8F4EA' if good else '#F3EFF6')),('BOX',(0,0),(-1,-1),.6,colors.HexColor('#78A889' if good else '#E2D9E9')),('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),7)]));flow.extend([box,Spacer(1,8)])
 flow.append(para('Resultado: '+q['success'],'small'))
 if q['id']=='charge':flow.append(para(q['hints'][0],'small'))
 flow.append(PageBreak())
flow.extend([para('ESCENAS NARRATIVAS / SIN RESPUESTA CORRECTA','label'),para('Decisiones para reírse','h')])
for s in data['story']:
 flow.extend([para(s['title'],'h'),para(s['text'])])
 if s.get('options'):
  for i,opt in enumerate(s['options']):flow.append(para(f'{chr(65+i)}. {opt}','small'))
 flow.append(para('Sin puntos ni solución verdadera. El presentador controla el avance. Las propuestas y sus opciones de votación dependen de lo que escriban los invitados.','small'))
flow.append(para('No proyectés este documento durante las rondas: las soluciones se revelan en el juego solamente después de cerrar el cupo.','body'))
doc.build(flow,onFirstPage=footer,onLaterPages=footer)
print(out)
